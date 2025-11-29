import {
  Award,
  CheckCircle,
  Sparkles,
  Twitter,
  Users,
  Wallet,
} from "lucide-react";
import React from "react";

const EarnTab = () => {
  const tasks = [
    {
      id: 1,
      name: "Follow on Farcaster",
      icon: Users,
      points: 100,
      completed: true,
    },
    {
      id: 2,
      name: "Follow on Twitter",
      icon: Twitter,
      points: 100,
      completed: false,
    },
    {
      id: 3,
      name: "Verify Wallet",
      icon: Wallet,
      points: 200,
      completed: true,
    },
    {
      id: 4,
      name: "Complete Profile",
      icon: CheckCircle,
      points: 150,
      completed: false,
    },
  ];
  return (
    // <div className="space-y-4 animate-fadeIn">
    //   {/* Points Display */}
    //   <div className="bg-amber-900 rounded-2xl p-6 border-2 border-amber-600 shadow-xl">
    //     <div className="flex items-center justify-between">
    //       <div>
    //         <p className="text-amber-200 text-sm mb-1">Total Points</p>
    //         <p className="text-white text-4xl font-bold">43564</p>
    //       </div>
    //       <div className="bg-amber-800 rounded-full p-3">
    //         <Award className="w-12 h-12 text-amber-300" />
    //       </div>
    //     </div>
    //   </div>

    //   {/* Tasks Section */}
    //   <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
    //     <h3 className="text-white text-lg font-bold mb-4 flex items-center">
    //       <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
    //       Social Tasks
    //     </h3>
    //     <div className="space-y-3">
    //       {tasks.map((task) => (
    //         <div
    //           key={task.id}
    //           className={`flex items-center justify-between p-4 rounded-xl transition-all border ${
    //             task.completed
    //               ? "bg-green-900 border-green-600"
    //               : "bg-slate-800 border-slate-700 hover:bg-slate-700"
    //           }`}
    //         >
    //           <div className="flex items-center space-x-3">
    //             <task.icon
    //               className={`w-5 h-5 ${
    //                 task.completed ? "text-green-400" : "text-purple-400"
    //               }`}
    //             />
    //             <span className="text-white text-sm font-medium">
    //               {task.name}
    //             </span>
    //           </div>
    //           <div className="flex items-center space-x-2">
    //             <span className="text-amber-400 text-sm font-bold">
    //               +{task.points}
    //             </span>
    //             {task.completed && (
    //               <CheckCircle className="w-5 h-5 text-green-400" />
    //             )}
    //           </div>
    //         </div>
    //       ))}
    //     </div>
    //   </div>
    // </div>
    <div className="text-center mt-4 text-lg text-white">Earn Coming Soon</div>
  );
};

export default EarnTab;
