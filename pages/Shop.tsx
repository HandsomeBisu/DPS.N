import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as ReactRouterDOM from 'react-router-dom';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Button } from '../components/ui/Button';
import { Coins, Check } from 'lucide-react';

const { useNavigate } = ReactRouterDOM as any;

const TOKEN_PACKAGES = [
  { amount: 10, price: '1,200원', tag: '' },
  { amount: 50, price: '5,500원', tag: 'BEST' },
  { amount: 100, price: '10,000원', tag: '+10% Bonus' },
  { amount: 500, price: '45,000원', tag: '+15% Bonus' },
];

export const Shop: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [purchasing, setPurchasing] = useState<number | null>(null);

  const handlePurchase = async (amount: number) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    setPurchasing(amount);
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      let currentTokens = 0;
      if (userSnap.exists()) {
        currentTokens = userSnap.data().tokens || 0;
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      await setDoc(userRef, { tokens: currentTokens + amount }, { merge: true });
      
      alert(`${amount} 토큰이 충전되었습니다!`);
      navigate('/profile');
    } catch (e) {
      console.error(e);
      alert('충전에 실패했습니다.');
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="pb-24 pt-8 px-6 md:px-10 max-w-4xl mx-auto min-h-screen">
       <div className="text-center mb-12 animate-slide-up">
         <div className="w-16 h-16 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Coins size={32} />
         </div>
         <h1 className="text-3xl font-bold text-white mb-2">토큰 충전소</h1>
         <p className="text-ios-gray">작품 소장을 위해 토큰을 충전해보세요.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {TOKEN_PACKAGES.map((pkg) => (
             <button 
               key={pkg.amount}
               disabled={purchasing !== null}
               onClick={() => handlePurchase(pkg.amount)}
               className="relative group bg-[#1C1C1E] border border-white/5 p-6 rounded-2xl flex items-center justify-between hover:bg-white/10 hover:border-ios-blue/50 transition-all text-left"
             >
                {pkg.tag && (
                   <span className="absolute -top-3 left-6 px-3 py-1 bg-ios-blue text-white text-[10px] font-bold uppercase rounded-full shadow-lg">
                      {pkg.tag}
                   </span>
                )}
                <div>
                   <div className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                      <Coins size={20} className="text-yellow-500" />
                      {pkg.amount}
                   </div>
                   <div className="text-sm text-ios-gray">토큰</div>
                </div>
                <div className="text-right">
                   <div className="text-lg font-medium text-white group-hover:text-ios-blue transition-colors">
                      {purchasing === pkg.amount ? (
                         <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : pkg.price}
                   </div>
                </div>
             </button>
          ))}
       </div>

       <div className="mt-12 p-6 bg-white/5 rounded-2xl text-xs text-ios-gray leading-relaxed">
          <h4 className="font-bold text-white mb-2">이용 안내</h4>
          <ul className="list-disc pl-4 space-y-1">
             <li>토큰은 웹소설 유료 회차 구매에 사용됩니다.</li>
             <li>충전된 토큰의 유효기간은 5년입니다.</li>
             <li>사용하지 않은 토큰은 구매 후 7일 이내에 청약철회가 가능합니다.</li>
             <li>데모 버전에서는 실제 결제가 이루어지지 않습니다.</li>
          </ul>
       </div>
    </div>
  );
};