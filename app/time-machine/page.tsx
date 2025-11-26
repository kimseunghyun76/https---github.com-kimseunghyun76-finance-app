"use client";

import { useState } from 'react';
import { api } from '@/lib/api';
import { Search, Calculator, ArrowRight, History, AlertCircle } from 'lucide-react';
import { StockSearchInput } from '@/components/StockSearchInput';

interface TimeMachineResult {
    ticker: string;
    past_date: string;
    past_price: number;
    current_price: number;
    shares: number;
    initial_investment: number;
    current_value: number;
    profit: number;
    roi: number;
}

export default function TimeMachinePage() {
    const [ticker, setTicker] = useState('');
    const [amount, setAmount] = useState<number>(1000);
    const [years, setYears] = useState<number>(5);
    const [result, setResult] = useState<TimeMachineResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const calculate = async () => {
        if (!ticker) {
            setError('종목을 선택해주세요.');
            return;
        }
        setLoading(true);
        setError('');
        setResult(null);

        try {
            // Calculate past date
            const date = new Date();
            date.setFullYear(date.getFullYear() - years);
            const dateStr = date.toISOString().split('T')[0];

            const data = await api.getTimeMachineCalculation(ticker, amount, dateStr);
            setResult(data);
        } catch (err) {
            console.error(err);
            setError('계산 중 오류가 발생했습니다. 종목이나 날짜를 확인해주세요.');
        } finally {
            setLoading(false);
        }
    };

    const getComparison = (value: number) => {
        const items = [
            { price: 20, name: "치킨 🍗", unit: "마리" },
            { price: 1000, name: "최신 아이폰 📱", unit: "대" },
            { price: 5000, name: "명품 가방 👜", unit: "개" },
            { price: 30000, name: "중형 세단 🚗", unit: "대" },
            { price: 100000, name: "포르쉐 911 🏎️", unit: "대" },
            { price: 500000, name: "서울 아파트 전세 🏠", unit: "채" },
            { price: 1000000, name: "개인 섬 🏝️", unit: "개" },
        ];

        // Find the most expensive item we can buy at least one of
        let bestItem = items[0];
        for (const item of items) {
            if (value >= item.price) {
                bestItem = item;
            }
        }

        const count = Math.floor(value / bestItem.price);
        return { ...bestItem, count };
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                    <span className="text-6xl">🕰️</span> FOMO 타임머신
                </h1>
                <p className="text-xl text-gray-400">
                    "그때 그 주식을 샀더라면..."<br />
                    당신의 인생이 어떻게 바뀌었을지 확인해보세요.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Input Card */}
                <div className="glass-card p-8 rounded-3xl border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <History className="w-6 h-6 text-purple-400" />
                        과거로 돌아가기
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">어떤 종목을 살까요?</label>
                            <StockSearchInput
                                onSelect={(t) => setTicker(t)}
                                placeholder="종목 검색 (예: NVDA, TSLA)"
                            />
                            {ticker && <div className="mt-2 text-emerald-400 text-sm font-bold">선택됨: {ticker}</div>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">얼마나 투자할까요? ($)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>
                            <div className="flex gap-2 mt-2">
                                {[100, 1000, 10000].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setAmount(val)}
                                        className="px-3 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
                                    >
                                        ${val.toLocaleString()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">언제로 돌아갈까요?</label>
                            <div className="grid grid-cols-4 gap-2">
                                {[1, 3, 5, 10].map(y => (
                                    <button
                                        key={y}
                                        onClick={() => setYears(y)}
                                        className={`py-3 rounded-xl font-bold transition-all ${years === y ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                    >
                                        {y}년 전
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={calculate}
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl font-bold text-white text-lg shadow-lg shadow-purple-500/25 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Calculator className="w-5 h-5" />
                                    결과 확인하기
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Result Card */}
                <div className="relative">
                    {result ? (
                        <div className="glass-card p-8 rounded-3xl border border-white/10 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-blue-500" />

                            <div className="text-center mb-8">
                                <div className="text-sm text-gray-400 mb-1">{result.past_date} 기준</div>
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    {result.ticker} {years}년 보유 시
                                </h2>
                                <div className={`text-5xl font-black font-mono mb-2 ${result.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {result.profit >= 0 ? '+' : ''}{result.roi.toFixed(0)}%
                                </div>
                                <div className="text-gray-400">
                                    수익금: <span className={result.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>${result.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>
                            </div>

                            <div className="space-y-4 bg-white/5 p-6 rounded-2xl mb-8">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">투자 원금</span>
                                    <span className="text-white font-mono">${result.initial_investment.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">현재 평가액</span>
                                    <span className="text-white font-bold font-mono text-lg">${result.current_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="h-px bg-white/10 my-2" />
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>매수 가격 ({result.past_date})</span>
                                    <span>${result.past_price.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>현재 가격</span>
                                    <span>${result.current_price.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Fun Comparison */}
                            {result.profit > 0 ? (
                                <div className="bg-gradient-to-br from-emerald-500/20 to-blue-500/20 p-6 rounded-2xl border border-emerald-500/30 text-center">
                                    <div className="text-sm text-emerald-300 mb-2 font-bold">🎉 축하합니다! (아니, 후회되나요?)</div>
                                    <div className="text-gray-300 mb-4">이 수익금이면...</div>

                                    {(() => {
                                        const comp = getComparison(result.profit);
                                        return (
                                            <div>
                                                <div className="text-4xl font-bold text-white mb-2">{comp.name}</div>
                                                <div className="text-2xl font-bold text-emerald-400">
                                                    {comp.count.toLocaleString()} {comp.unit}
                                                </div>
                                                <div className="text-sm text-gray-400 mt-2">를 살 수 있었습니다!</div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <div className="bg-rose-500/10 p-6 rounded-2xl border border-rose-500/20 text-center">
                                    <div className="text-xl font-bold text-rose-400 mb-2">😱 다행이다!</div>
                                    <p className="text-gray-300">
                                        그때 샀으면 <span className="text-rose-400 font-bold">${Math.abs(result.profit).toLocaleString()}</span>를 잃었을 겁니다.<br />
                                        안 사길 잘했네요!
                                    </p>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-50">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                <span className="text-4xl">🔮</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">미래를 확인해보세요</h3>
                            <p className="text-gray-400">
                                좌측에서 종목과 기간을 선택하면<br />
                                놀라운 결과가 나타납니다.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
