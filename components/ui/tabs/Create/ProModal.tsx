import React, { useEffect, useState } from "react";
import Modal from "../../common/Modal";
import { Check, Loader, X } from "lucide-react";
import {
  useAccount,
  useConnect,
  useReadContract,
  useSwitchChain,
  useTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { abi } from "@/contracts/abi";
import { formatEther, formatUnits } from "viem";
import { useFrame } from "@/components/providers/farcaster-provider";
import toast from "react-hot-toast";
import { SUB_IMAGE_LIMIT, SUB_TEXT_LIMIT } from "@/lib/limits";
import { base } from "viem/chains";
import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";

const ProModal = ({
  setShowProModal,
  refetchStatus,
}: {
  setShowProModal: (val: boolean) => void;
  refetchStatus: () => void;
}) => {
  const { context, actions } = useFrame();
  const [selectedPlan, setSelectedPlan] = useState(1);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const { chainId, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { connectAsync } = useConnect();

  const {
    writeContractAsync: payTx,
    data: txHash,
    isPending: isPayPending,
  } = useWriteContract();
  const {
    data: receipt,
    isSuccess: isPaymentConfirmed,
    isPending: isConfirming,
  } = useTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash },
  });

  const {
    data: requiredPayment,
    isLoading: requiredPriceLoading,
    refetch: refetchPrice,
    isFetching: fetchingPrice,
  } = useReadContract({
    address: abi.AiSubscription.address,
    abi: abi.AiSubscription.abi,
    functionName: "getRequiredPayment",
    args: [BigInt(selectedPlan)],
  });
  const { data: pricePerMonthUSD } = useReadContract({
    address: abi.AiSubscription.address,
    abi: abi.AiSubscription.abi,
    functionName: "pricePerMonthUSD",
  });

  const plans = [
    { months: 1, price: 10, discount: 0 },
    { months: 3, price: 25, discount: 17 },
    { months: 6, price: 45, discount: 25 },
  ];
  const benefits = [
    "Early Access to New Features",
    "Best Engaging cast generate",
    "Detailed Profile Analysis",
  ];
  const perMonthPrice = pricePerMonthUSD
    ? parseFloat(formatUnits(pricePerMonthUSD, 8))
    : 0;

  const handlePay = async () => {
    if (!context || !context?.user?.fid) {
      return;
    }
    try {
      if (!isConnected) {
        await connectAsync({ connector: miniAppConnector() });
      }
      if (chainId !== base.id) {
        await switchChainAsync({ chainId: base.id });
      }
      await refetchPrice();
      await payTx({
        address: abi.AiSubscription.address,
        abi: abi.AiSubscription.abi,
        functionName: "subscribe",
        args: [BigInt(selectedPlan), BigInt(context.user.fid)],
        value: requiredPayment,
      });
    } catch (error) {}
  };

  useEffect(() => {
    if (isPaymentConfirmed && receipt) {
      setSubscriptionLoading(true);
      fetch("/api/ai/subscription/webhook", {
        method: "POST",
        body: JSON.stringify({
          txHash,
          fid: context?.user?.fid,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success) {
            refetchStatus();
            toast.success("Subscription activated");
          }
          setShowProModal(false);
        })
        .catch((err) => {
          toast.error("Activation failed. Contact support");
        })
        .finally(() => {
          setSubscriptionLoading(false);
        });
    }
  }, [isPaymentConfirmed, receipt]);

  const isTxConfirming = txHash && isConfirming;
  const loadingState =
    isPayPending ||
    requiredPriceLoading ||
    fetchingPrice ||
    isTxConfirming ||
    subscriptionLoading;
  return (
    <Modal>
      <div className="bg-purple-800 w-full p-4 rounded-xl relative text-white">
        <span
          onClick={() => setShowProModal(false)}
          className="absolute right-3 top-3 hover:bg-purple-900 p-1 rounded-full cursor-pointer"
        >
          <X />
        </span>
        <h1 className="text-center text-xl font-semibold mb-4 ">
          Farstate Ai Pro
        </h1>

        {/* Limit */}
        <div className=" bg-purple-900 p-3 rounded-xl">
          <h3 className="text-sm mb-2">Pro Tier Limit</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-900 text-center rounded-lg px-2 py-1.5 border border-purple-600">
              <p className="text-purple-200 text-xs ">Daily Cast</p>
              <p className={`  text-sm font-bold text-center text-white`}>
                {SUB_TEXT_LIMIT}
              </p>
            </div>
            <div className="bg-purple-900 text-center rounded-lg px-2 py-1.5 border border-purple-600">
              <p className="text-purple-200 text-xs">Daily Thumbnail</p>
              <p className={`  text-sm font-bold text-center text-white`}>
                {SUB_IMAGE_LIMIT}
              </p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-purple-200 mb-3">
            Pro Tier Benefits
          </h3>
          <div className="space-y-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="bg-purple-600 rounded-full p-0.5">
                  <Check size={14} />
                </div>
                <p className="text-xs text-purple-100">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Plan selection */}
        <div className=" mt-4">
          <h3 className="text-sm font-semibold text-purple-200 mb-2">
            Select Duration
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {plans.map((plan) => (
              <button
                key={plan.months}
                onClick={() => setSelectedPlan(plan.months)}
                className={`relative rounded-lg p-2 border transition-all ${
                  selectedPlan === plan.months
                    ? "bg-purple-600 border-purple-400 shadow-lg scale-105"
                    : "bg-purple-800 border-purple-700 hover:border-purple-600"
                }`}
              >
                <p className="text-md font-bold">{plan.months}</p>
                <p className="text-xs text-purple-200">
                  {plan.months === 1 ? "Month" : "Months"}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Price Display */}
        <div className="bg-purple-950 bg-opacity-50 rounded-xl p-2 mt-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-purple-300 text-sm">Total Price</p>
              <p className="text-xs text-purple-400 mt-0.5">
                ${perMonthPrice}
                /month
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">
                ${perMonthPrice * selectedPlan}
              </p>
            </div>
          </div>
        </div>

        <button
          disabled={loadingState}
          onClick={handlePay}
          className="w-full bg-purple-500 mt-4 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold "
        >
          {loadingState && <Loader className="animate-spin" />}
          <span>
            {" "}
            Pay {requiredPayment
              ? formatEther(requiredPayment).slice(0, 7)
              : 0}{" "}
            ETH
          </span>
        </button>

        <p className="text-center mx-auto text-xs mt-2">
          If subscription not activate please :{" "}
          <span
            onClick={() => {
              actions?.openUrl("https://forms.gle/tiAGut6ttdC5yX6CA");
            }}
            className="text-purple-300 underline cursor-pointer"
          >
            Submit this Form
          </span>
        </p>
      </div>
    </Modal>
  );
};

export default ProModal;
