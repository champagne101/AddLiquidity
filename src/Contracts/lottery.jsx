import ABI from './abi';

const lotteryAbi = ABI;

const lotteryContract = web3 => {
    return new web3.eth.Contract(
        lotteryAbi,
        "0x0E4f394A805a38e260B611063eA8141FBCdDEaaa"
    )
}

export default lotteryContract