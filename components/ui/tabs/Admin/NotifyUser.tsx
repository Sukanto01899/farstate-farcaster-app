import React, { useEffect, useState } from "react";
import { MiniAppNotificationDetails } from "@farcaster/miniapp-core";
import { useMutation } from "@tanstack/react-query";
import { notificationsBtn } from "@/lib/constants";
import { useFrame } from "@/components/providers/farcaster-provider";

const NotifyUsers = () => {
  const { context, actions } = useFrame();
  const [result, setResult] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notificationDetails, setNotificationDetails] =
    useState<MiniAppNotificationDetails | null>(null);

  const fid = context?.user?.fid;

  useEffect(() => {
    if (context?.user?.fid) {
      setNotificationDetails(context?.client.notificationDetails ?? null);
    }
  }, [context]);

  const { mutate: sendNotification, isPending: isSendingNotification } =
    useMutation({
      mutationFn: async ({ title, body }: { title: string; body: string }) => {
        if (!adminPassword.trim()) {
          throw new Error("Missing admin password");
        }
        return await fetch("/api/send-notification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminPassword.trim()}`,
          },
          body: JSON.stringify({
            title,
            body,
          }),
        });
      },
      onMutate: () => {
        setResult(null);
      },
      onSuccess: (response) => {
        if (response.status === 200) setResult("Notification sent!");
        else if (response.status === 401)
          setResult("Unauthorized (wrong admin password).");
        else if (response.status === 429)
          setResult("Rate limited. Try again later.");
        else setResult("Error sending notification.");
      },
      onError: (error) => {
        if (error instanceof Error && error.message === "Missing admin password") {
          setResult("Enter the admin password first.");
        } else {
          setResult("Error sending notification.");
        }
      },
    });
  return (
    <div className="w-full flex flex-col items-center gap-2 backdrop-blur-md border border-purple-500 rounded-2xl shadow-lg p-2">
      <div>
        <h1 className="text-purple-600 text-md font-bold">
          Send Notifications
        </h1>
      </div>
      <div className="w-full flex items-center gap-2">
        <input
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
          type={showPassword ? "text" : "password"}
          placeholder="Admin password"
          className="w-full px-3 py-2 rounded-xl border border-purple-500 bg-transparent text-white placeholder:text-white/60 outline-none"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="px-3 py-2 rounded-xl border border-purple-500 text-white"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
      <div className="w-full grid grid-cols-2 items-center gap-2 ">
        {notificationsBtn.map((notify) => (
          <button
            key={notify.id}
            disabled={isSendingNotification || !adminPassword.trim()}
            onClick={() =>
              sendNotification({
                title: notify.title,
                body: notify.body,
              })
            }
            className="py-2 px-3 bg-blue-600 rounded-2xl text-white"
          >
            {isSendingNotification ? "Sending..." : notify.name}
          </button>
        ))}
      </div>

      {result && <p className="mt-2 text-sm text-white">{result}</p>}
    </div>
  );
};

export default NotifyUsers;
