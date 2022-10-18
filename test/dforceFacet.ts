const DforceFacet = artifacts.require('DforceFacet');
const {
  BN, // Big Number support
} = require('@openzeppelin/test-helpers');
import UNISWAP from '../build/contracts/IUniswapV2Router02.json';
import IERC20 from '../build/contracts/IERC20.json';
import { UNISWAP_ADDRESS, WETH_ADDRESS, DFORCE_COMPTROLLER_ADDRESS } from '../constants/mainnet';
import { DETH_ADDRESS, DUSDC_ADDRESS, USDC_ADDRESS } from '../constants/tokenAddress';

export enum NETWORKS {
  MAINNET = 'MAINNET',
  POLYGON = 'POLYGON',
  BSC = 'BSC',
  FANTOM = 'FANTOM',
  HARMONY = 'HARMONY',
  ARBITRUM = 'ARBITRUM',
  CRONOS = 'CRONOS',
  AURORA = 'AURORA',
  OPTIMISM = 'OPTIMISM'
}

contract('Dforce Facet', async (accounts) => {
  let dforceFacet;
  let dforceFacetImpl;
  let uniswapRouter;
  let usdc;
  let iusdc;
  let ieth;

  before(async () => {

    dforceFacetImpl = await DforceFacet.deployed();
    dforceFacet = new web3.eth.Contract(dforceFacetImpl.abi, dforceFacetImpl.address);

    //create instances of erc20 contracts
    usdc = new web3.eth.Contract(IERC20.abi as AbiItem[], USDC_ADDRESS[NETWORKS.MAINNET]);

    iusdc = new web3.eth.Contract(IERC20.abi as AbiItem[], DUSDC_ADDRESS[NETWORKS.MAINNET]);

    ieth = new web3.eth.Contract(IERC20.abi as AbiItem[], DETH_ADDRESS[NETWORKS.MAINNET]);

    uniswapRouter = new web3.eth.Contract(UNISWAP.abi as AbiItem[], UNISWAP_ADDRESS.V2);
  });


  it('Sets Comptroller Address', async () => {
    await dforceFacet.methods
      .setDforceComptrollerAddr(DFORCE_COMPTROLLER_ADDRESS)
      .send({ from: accounts[0] });

    const comptrollerAddr = await dforceFacet.methods.getDforceComptrollerAddr().call();

    assert.equal(comptrollerAddr, DFORCE_COMPTROLLER_ADDRESS);
  });

  it('is able to set fee', async () => {
    const newFee = 100;
    //in bps
    const setFeeTx = await dforceFacet.methods.setDforceFee(newFee).send({ from: accounts[0] });
    const currentFee = await dforceFacet.methods.getDforceFee().call();

    assert.equal(currentFee, newFee);
  });

  it('is able to change fee', async () => {
    const newFee = 3;

    const setFeeTx = await dforceFacet.methods.setDforceFee(newFee).send({ from: accounts[0] });

    const updatedFee = await dforceFacet.methods.getDforceFee().call();

    assert.equal(updatedFee, newFee);
  });

  describe('Trading Functions of Dforce Facet', async () => {
    let contract_ETHBalance;
    let contract_USDCBalance;
    let acc1_ETHBalance;
    let acc1_USDCBalance;
    let acc1_IETHBalance;
    let acc1_IUSDCBalance;


    const getBalance = async() => {
      contract_ETHBalance = await web3.eth.getBalance(dforceFacetImpl.address);
      acc1_ETHBalance = await web3.eth.getBalance(accounts[1]);

      contract_USDCBalance = await usdc.methods.balanceOf(dforceFacetImpl.address).call();
      acc1_USDCBalance = await usdc.methods.balanceOf(accounts[1]).call();

      acc1_IUSDCBalance = await iusdc.methods.balanceOf(accounts[1]).call();
      acc1_IETHBalance = await ieth.methods.balanceOf(accounts[1]).call();

      console.log(`Contract addr ${dforceFacetImpl.address} has balance:` , {
        eth: contract_ETHBalance,
        usdc: contract_USDCBalance
      })

      console.log(`Acc addr ${accounts[1]} has balance:` , {
        eth: acc1_ETHBalance,
        usdc: acc1_USDCBalance,
        iusdc: acc1_IUSDCBalance,
        ieth: acc1_IETHBalance,
      })
    }
    beforeEach(async () => {
      console.log(`----------------------------Before----------------------------`)
      await getBalance()
    });

    afterEach(async() => {
      console.log(`----------------------------After----------------------------`)
      await getBalance()
    })

    it('able to deposit eth', async () => {

      const ETH_TO_DEPOSIT = 10000;
      const feeRate = (await dforceFacet.methods.getDforceFee().call()) / 10000; // fee is in bp
      const expectedFee = Math.round(ETH_TO_DEPOSIT * feeRate); //in wei

      const depositTx = await dforceFacet.methods.depositDforceEth().send({
        from: accounts[1],
        value: ETH_TO_DEPOSIT
      });

      const acc1_ETHAfterDeposit = await web3.eth.getBalance(accounts[1]);

      const { effectiveGasPrice, gasUsed } = depositTx;
      const estimateGasCost = new BN(gasUsed).mul(new BN(effectiveGasPrice));

      assert.equal(
        new BN(await web3.eth.getBalance(dforceFacetImpl.address)).toString(),
        new BN(contract_ETHBalance).add(new BN(expectedFee)).toString()
      );

      assert.equal(
        new BN(acc1_ETHAfterDeposit).toString(),
        new BN(acc1_ETHBalance.toString())
          .sub(new BN(ETH_TO_DEPOSIT.toString()))
          .sub(new BN(estimateGasCost.toString()))
          .toString()
      );

      const acc1_IETHAfterDeposit = await ieth.methods.balanceOf(accounts[1]).call();

      const acc1_MintedIEthAmount = depositTx.events['Deposited'].returnValues._amount;

      //calculate net change
      const netChange = acc1_IETHAfterDeposit - acc1_IETHBalance;

      assert.equal(new BN(acc1_MintedIEthAmount).toString(), new BN(netChange).toString());
    });

    it('able to deposit erc20', async () => {
      const currentUnixTime = Math.floor(Date.now() / 1000);
      const deadline = currentUnixTime + 86400;
      const gasNeeded = 0.15 * 10 ** 6 * 2;

      //swap for usdc
      const swapResult = await uniswapRouter.methods
        .swapETHForExactTokens(
          Math.round(10000 * (10 * 6)), //usdc has 6 decimals. here we are converting to 10k usdc
          [WETH_ADDRESS, USDC_ADDRESS.MAINNET],
          accounts[1],
          deadline
        )
        .send({
          from: accounts[1],
          value: web3.utils.toWei('10', 'ether'),
          gas: gasNeeded
        });

      const acc1_ERC20Balance = await usdc.methods.balanceOf(accounts[1]).call();

      const contract_ERC20Balance = await usdc.methods.balanceOf(dforceFacetImpl.address).call();

      const acc1_iTokenBalance = await iusdc.methods.balanceOf(accounts[1]).call();

      const feeRate = (await dforceFacet.methods.getDforceFee().call()) / 10000; // fee is in bps
      const expectedFee = Math.round(acc1_ERC20Balance * feeRate);

      await usdc.methods
        .approve(dforceFacetImpl.address, acc1_ERC20Balance)
        .send({ from: accounts[1] });

      const depositTx = await dforceFacet.methods
        .depositDforceERC20(
          USDC_ADDRESS[NETWORKS.MAINNET],
          DUSDC_ADDRESS[NETWORKS.MAINNET],
          acc1_ERC20Balance
        )
        .send({ from: accounts[1] });

      const acc1_ERC20BalanceAfterDeposit = await usdc.methods.balanceOf(accounts[1]).call();

      const contract_ERC20BalanceAfterDeposit = await usdc.methods.balanceOf(dforceFacetImpl.address).call();

      const acc1_iTokenBalanceAfterDeposit = await iusdc.methods.balanceOf(accounts[1]).call();

      assert.equal(acc1_ERC20BalanceAfterDeposit.toString(), '0');

      assert.equal(
        new BN(contract_ERC20BalanceAfterDeposit.toString()).toString(),
        new BN(contract_ERC20Balance.toString()).add(new BN(expectedFee.toString())).toString()
      );

      const acc1_MintediTokenAmount = depositTx.events['Deposited'].returnValues._amount;
      const netChange = acc1_iTokenBalanceAfterDeposit - acc1_iTokenBalance;

      assert.equal(new BN(netChange).toString(), new BN(acc1_MintediTokenAmount).toString());
    });
  });
});
