import Head from "next/head"
import styles from "../styles/Home.module.css"
import Header from "../components/Header"
import LotteryEntrance from "../components/LotteryEntrance"

export default function Home() {
    return (
        <main className="bg-gradient-to-b from-gray-100 to-gray-300 min-h-screen">
            <Head>
                <title>Smart Contract Lottery</title>
                <meta name="description" content="smart contract lottery" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <h2 className="text-3xl text-center py-8">
                Decentralized Automated Smart Contract Lottery
            </h2>
            <br />
            <Header /> <br />
            <LotteryEntrance />
        </main>
    )
}
