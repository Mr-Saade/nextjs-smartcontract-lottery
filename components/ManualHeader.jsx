import { useMoralis } from "react-moralis"
import { useEffect } from "react"

export default function ManualHeader() {
    const { enableWeb3, account, isWeb3Enabled, Moralis, deactivateWeb3, isWeb3EnableLoading } =
        useMoralis()
    useEffect(() => {
        if (
            !isWeb3Enabled &&
            typeof window != "undefined" &&
            window.localStorage.getItem("connected")
        ) {
            console.log("Already connected")
            enableWeb3()
        }
    }, [isWeb3Enabled])
    useEffect(() => {
        Moralis.onAccountChanged((account) => {
            if (account != null) {
                console.log(`Connected to ${account}`)
            } else {
                window.localStorage.removeItem("connected")
                deactivateWeb3()
                console.log("No account Found!")
            }
        })
    }, [])
    useEffect(() => {
        console.log(`isWeb3Enabled: ${isWeb3Enabled}`)
    })
    return (
        <div>
            {account ? (
                <div>
                    Connected to {account.slice(0, 6)}...{account.slice(account.length - 4)}
                </div>
            ) : (
                <button
                    onClick={async () => {
                        await enableWeb3()
                        if (typeof window != "undefined") {
                            window.localStorage.setItem("connected", "injected")
                        }
                    }}
                    disabled={isWeb3EnableLoading}
                >
                    Connect
                </button>
            )}
        </div>
    )
}
