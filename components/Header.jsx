import { ConnectButton } from "web3uikit"

export default function Header() {
    return (
        <div className="flex justify-end px-6 py-4">
            <ConnectButton
                moralisAuth={false}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            />
        </div>
    )
}
