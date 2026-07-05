import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { StreamChat } from "stream-chat";
import useAuthUser from "../hooks/useAuthUser";
import { getStreamToken } from "../lib/api";
import { BellIcon, HomeIcon, PencilIcon, ShipWheelIcon, UsersIcon } from "lucide-react";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;
  const [messageNotificationCount, setMessageNotificationCount] = useState(0);

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    let isMounted = true;
    let client = null;
    let intervalId = null;

    const syncUnreadCount = async () => {
      if (!client?.userID) return;
      try {
        const count = await client.getUnreadCount();
        if (isMounted) {
          setMessageNotificationCount(count || 0);
        }
      } catch (error) {
        console.error("Could not sync unread count", error);
      }
    };

    const initChat = async () => {
      if (!tokenData?.token || !authUser?._id) {
        if (isMounted) setMessageNotificationCount(0);
        return;
      }

      try {
        client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        const handleNewMessage = (event) => {
          if (event.user?.id && event.user.id !== client.userID) {
            setMessageNotificationCount((prev) => prev + 1);
          }
        };

        client.on("notification.message_new", handleNewMessage);
        client.on("message.new", handleNewMessage);

        await syncUnreadCount();
        intervalId = setInterval(syncUnreadCount, 5000);
      } catch (error) {
        console.error("Sidebar chat connection error", error);
      }
    };

    initChat();

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
      if (client?.userID) {
        client.disconnectUser().catch(() => { });
      }
    };
  }, [authUser?._id, authUser?.fullName, authUser?.profilePic, tokenData?.token]);

  return (
    <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-base-300">
        <Link to="/" className="flex items-center gap-2.5">
          <ShipWheelIcon className="size-9 text-primary" />
          <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
            Streamify
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <Link
          to="/"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === "/" ? "btn-active" : ""
            }`}
        >
          <HomeIcon className="size-5 text-base-content opacity-70" />
          <span>Home</span>
        </Link>

        <Link
          to="/friends"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === "/friends" ? "btn-active" : ""
            }`}
        >
          <UsersIcon className="size-5 text-base-content opacity-70" />
          <span>Friends</span>
        </Link>

        <Link
          to="/notifications"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === "/notifications" ? "btn-active" : ""
            }`}
        >
          <div className="relative">
            <BellIcon className="size-5 text-base-content opacity-70" />
            {messageNotificationCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-content">
                {messageNotificationCount > 9 ? "9+" : messageNotificationCount}
              </span>
            )}
          </div>
          <span>Notifications</span>
        </Link>

        <Link
          to="/edit-profile"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === "/edit-profile" ? "btn-active" : ""
            }`}
        >
          <PencilIcon className="size-5 text-base-content opacity-70" />
          <span>Edit Profile</span>
        </Link>
      </nav>

      {/* USER PROFILE SECTION */}
      <div className="p-4 border-t border-base-300 mt-auto">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-10 rounded-full">
              <img src={authUser?.profilePic} alt="User Avatar" />
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{authUser?.fullName}</p>
            <p className="text-xs text-success flex items-center gap-1">
              <span className="size-2 rounded-full bg-success inline-block" />
              Online
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
