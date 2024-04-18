import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"
export default function LotteryEntrace() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const [entranceFee, setEntranceFee] = useState("0")
    const [numOfPlayers, setNumOfPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("")

    const [contractBalance, setContractBalance] = useState(0)
    const [countdown, setCountdown] = useState(30)

    const dispatch = useNotification()
    const chainId = parseInt(chainIdHex)

    const lotteryAddress = chainId in contractAddresses ? contractAddresses[chainId] : null

    const {
        runContractFunction: enterLottery,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "enterLottery",
        params: {},
        msgValue: entranceFee,
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "getEntranceFee",
        params: {},
    })
    const { runContractFunction: getWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "getWinner",
        params: {},
    })
    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })
    const { runContractFunction: getContractBalance } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "getContractBalance",
        params: {},
    })

    const handleSuccess = async (tx) => {
        await tx.wait(1) //wait for transaction confirmation as onSuccess only checks if transaction has been sent to wallet
        handleNewNotification()
        setNumOfPlayers((await getNumberOfPlayers()).toString())
        setContractBalance(await getContractBalance())
    }
    const handleError = async () => {
        dispatch({
            type: "error",
            message: "Transaction Failed!",
            title: "Transaction Notification",
            icon: "bell",
            position: "topR",
        })
    }
    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            icon: "bell",
            position: "topR",
        })
    }
    const handleWinnerEvent = async () => {
        console.log("WInner Picked!")
        setRecentWinner((await getWinner()).toString())
        setNumOfPlayers((await getNumberOfPlayers()).toString())
        setContractBalance(await getContractBalance())
        setCountdown(30)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            async function updateUI() {
                if (parseInt(numOfPlayers) > 1) {
                    const interval = setInterval(() => {
                        setCountdown((prevCountdown) => {
                            if (prevCountdown === 0) {
                                clearInterval(interval)

                                return 0 // Stop countdown at 0
                            } else {
                                return prevCountdown - 1
                            }
                        })
                    }, 1000)

                    return () => clearInterval(interval)
                }
                const provider = new ethers.providers.Web3Provider(window.ethereum)
                const Lottery = new ethers.Contract(lotteryAddress, abi, provider)

                Lottery.on("RequestFulfilled", handleWinnerEvent)
                setEntranceFee(await getEntranceFee())
                setRecentWinner((await getWinner()).toString())
                setNumOfPlayers((await getNumberOfPlayers()).toString())
            }
            updateUI()
        }
    }, [isWeb3Enabled, numOfPlayers])

    return (
        <div className="max-w-md mx-auto bg-white bg-opacity-50 rounded-lg shadow-md p-6 my-8">
            {lotteryAddress ? (
                <div>
                    <div className="absolute top-0 left-0 p-4 bg-gray-900 text-white">
                        <p>Contract Balance: {ethers.utils.formatEther(contractBalance)} ETH</p>
                    </div>
                    {numOfPlayers > 1 && (
                        <div className="mt-4">
                            <p className="text-lg font-semibold mb-2">
                                Time remaining: {countdown} seconds
                            </p>
                            <div className="relative h-4 bg-gray-200 rounded-full">
                                <div
                                    className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                                    style={{ width: `${(countdown / 30) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                    <p>EntranceFee: {ethers.utils.formatEther(entranceFee)} ETH</p>
                    <p>Recent Winner : {recentWinner}</p>
                    <p>Players: {numOfPlayers}</p> <br />
                    <button
                        onClick={async () =>
                            await enterLottery({
                                onSuccess: handleSuccess,
                                onError: handleError,
                            })
                        }
                        disabled={isLoading || isFetching || countdown == 0}
                        className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center ${
                            isLoading || isFetching ? "cursor-wait" : ""
                        }`}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            "Enter Lottery"
                        )}
                    </button>
                </div>
            ) : (
                <p>No address detected on network!</p>
            )}
            {/* FAQ Section */}
            <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">FAQ</h2>
                <div className="space-y-4">
                    <div>
                        <p className="font-semibold">How are winners selected?</p>
                        <p>
                            Winners are selected with a 30-second countdown timer as soon as the
                            lottery is open and there is more than 1 player in the lottery.
                        </p>
                    </div>
                    <div>
                        <p className="font-semibold">When does the lottery state change?</p>
                        <p>
                            The lottery state is closed when the timer hits 0 ,no new entries would
                            be allowed until after a winner has been picked where the lottery state
                            becomes open again.
                        </p>
                    </div>
                    <div>
                        <p className="font-semibold">How is the winner selected?</p>
                        <p>
                            A provably verifiably random number is generated by Chainlink&apos;s
                            VRF Service to acquire the random winner.
                        </p>
                    </div>
                    <div>
                        <p className="font-semibold">What automates the lottery process?</p>
                        <p>Chainlink Keepers automate the whole lottery process.</p>
                    </div>
                    <div>
                        <p className="font-semibold">
                            What happens to the ETH in the lottery pool?
                        </p>
                        <p>All the ETH in the lottery pool is then sent to the winner.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
