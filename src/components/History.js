import React, { useState, useEffect } from 'react'
import { retrievePublicKey } from './Freighter'
import * as StellarSdk from '@stellar/stellar-sdk'

const History = ({ publicKey: propPublicKey, onBack }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const Server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

    useEffect(() => {
        fetchTransactionHistory();
    }, [propPublicKey]);

    const fetchTransactionHistory = async () => {
        try {
            setLoading(true);
            setError("");

            // Use prop first, then retrieve
            let address = propPublicKey;
            if (!address) {
                try {
                    address = await retrievePublicKey();
                } catch (error) {
                    setError("Failed to retrieve wallet address. Please try again.");
                    setLoading(false);
                    return;
                }
            }

            if (!address || address.trim() === "") {
                setError("Wallet address not available. Please reconnect your wallet.");
                setLoading(false);
                return;
            }

            const response = await Server.transactions()
                .forAccount(address)
                .limit(50)
                .order("desc")
                .call();

            const formattedTransactions = response.records.map((tx) => ({
                id: tx.hash,
                date: new Date(tx.created_at).toLocaleString(),
                hash: tx.hash,
                type: tx.type,
                sourceAccount: tx.source_account,
                memo: tx.memo,
            }));

            setTransactions(formattedTransactions);
        } catch (err) {
            console.log(err);
            setError("Failed to load transaction history");
        } finally {
            setLoading(false);
        }
    }

    const truncateHash = (hash) => `${hash.slice(0, 10)}...${hash.slice(-10)}`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-900 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={onBack}
                        className="text-green-400 hover:text-green-300 font-semibold mb-4 inline-flex items-center transition duration-200"
                    >
                        ← Back
                    </button>
                    <h2 className="text-3xl font-bold text-white font-poppins">Transaction History</h2>
                    <p className="text-slate-400 text-sm mt-2 font-inter">View all your transaction history</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-900 text-red-200 border border-red-700 rounded-lg font-semibold">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                        </div>
                        <p className="text-slate-400 mt-4 font-inter">Loading transactions...</p>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="bg-slate-800/80 rounded-lg border border-green-500/30 p-12 text-center">
                        <p className="text-slate-400 text-lg font-inter">No transactions found</p>
                    </div>
                ) : (
                    <div className="bg-slate-800/80 rounded-lg shadow-xl border border-green-500/40 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-700/50 border-b border-green-500/30">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-slate-300 font-semibold text-sm font-poppins">
                                            Date
                                        </th>
                                        <th className="px-6 py-4 text-left text-slate-300 font-semibold text-sm font-poppins">
                                            Type
                                        </th>
                                        <th className="px-6 py-4 text-left text-slate-300 font-semibold text-sm font-poppins">
                                            Hash
                                        </th>
                                        <th className="px-6 py-4 text-left text-slate-300 font-semibold text-sm font-poppins">
                                            Memo
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-green-500/20">
                                    {transactions.map((tx, index) => (
                                        <tr
                                            key={tx.id}
                                            className="hover:bg-slate-700/50 transition duration-150 border-l-4 border-l-transparent hover:border-l-green-500"
                                        >
                                            <td className="px-6 py-4 text-slate-300 text-sm font-inter">
                                                {tx.date}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-block bg-green-900/50 text-green-200 px-3 py-1 rounded-full text-xs font-semibold font-inter">
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="text-slate-400 font-mono text-xs bg-slate-700 px-2 py-1 rounded font-inter">
                                                    {truncateHash(tx.hash)}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300 text-sm font-inter">
                                                {tx.memo || (
                                                    <span className="text-slate-500 italic">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <button
                    onClick={fetchTransactionHistory}
                    disabled={loading}
                    className="mt-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-lg transition duration-200 transform hover:scale-105"
                >
                    Refresh
                </button>
            </div>
        </div>
    )
}

export default History
