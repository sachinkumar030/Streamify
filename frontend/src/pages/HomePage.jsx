import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import {
  CheckCircleIcon,
  MapPinIcon,
  MessageCircleIcon,
  SparklesIcon,
  UserPlusIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";

import { capitialize } from "../lib/utils";

import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import useAuthUser from "../hooks/useAuthUser";

const HomePage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
    }
    setOutgoingRequestsIds(outgoingIds);
  }, [outgoingFriendReqs]);

  const liveChatFriends = friends.slice(0, 3);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-10">
        <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="card overflow-hidden border border-primary/20 bg-gradient-to-br from-primary via-primary/90 to-secondary text-primary-content shadow-2xl">
            <div className="card-body p-6 sm:p-8">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] opacity-80">
                <SparklesIcon className="size-4" />
                Live language hub
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold">
                Welcome back, {authUser?.fullName || "learner"}!
              </h1>
              <p className="max-w-2xl text-sm sm:text-base opacity-90">
                Jump into real conversations, keep a steady streak, and discover new practice partners
                every day.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to={friends[0] ? `/chat/${friends[0]._id}` : "/notifications"}
                  className="btn btn-neutral btn-sm"
                >
                  <MessageCircleIcon className="mr-2 size-4" />
                  Start a live chat
                </Link>
                <Link
                  to="/notifications"
                  className="btn btn-outline btn-sm border-primary-content/40 text-primary-content hover:bg-primary-content/10"
                >
                  <UsersIcon className="mr-2 size-4" />
                  View requests
                </Link>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-lg">
            <div className="card-body p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ZapIcon className="size-4 text-warning" />
                Quick conversations
              </div>
              <div className="space-y-3">
                {liveChatFriends.length > 0 ? (
                  liveChatFriends.map((friend) => (
                    <div
                      key={`live-${friend._id}`}
                      className="flex items-center justify-between rounded-xl bg-base-100 p-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="w-10 rounded-full">
                            <img src={friend.profilePic} alt={friend.fullName} />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{friend.fullName}</p>
                          <p className="text-xs opacity-70">Online • ready to chat</p>
                        </div>
                      </div>
                      <Link to={`/chat/${friend._id}`} className="btn btn-ghost btn-sm">
                        <MessageCircleIcon className="size-4" />
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-base-300 p-4 text-sm opacity-70">
                    Add friends to start live conversations.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Friends</h2>
            <Link to="/notifications" className="btn btn-outline btn-sm">
              <UsersIcon className="mr-2 size-4" />
              Friend Requests
            </Link>
          </div>

          {loadingFriends ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : friends.length === 0 ? (
            <NoFriendsFound />
          ) : (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {friends.map((friend) => (
                <FriendCard key={friend._id} friend={friend} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Meet New Learners</h2>
                <p className="opacity-70">
                  Discover perfect language exchange partners based on your profile
                </p>
              </div>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-200 p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">No recommendations available</h3>
              <p className="text-base-content opacity-70">
                Check back later for new language partners!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                return (
                  <div
                    key={user._id}
                    className="card bg-base-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="card-body p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar size-16 rounded-full">
                          <img src={user.profilePic} alt={user.fullName} />
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg">{user.fullName}</h3>
                          {user.location && (
                            <div className="flex items-center text-xs opacity-70 mt-1">
                              <MapPinIcon className="size-3 mr-1" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <span className="badge badge-secondary">
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitialize(user.nativeLanguage)}
                        </span>
                        <span className="badge badge-outline">
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {capitialize(user.learningLanguage)}
                        </span>
                      </div>

                      {user.bio && <p className="text-sm opacity-70">{user.bio}</p>}

                      <button
                        className={`btn w-full mt-2 ${hasRequestBeenSent ? "btn-disabled" : "btn-primary"
                          } `}
                        onClick={() => sendRequestMutation(user._id)}
                        disabled={hasRequestBeenSent || isPending}
                      >
                        {hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className="size-4 mr-2" />
                            Request Sent
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-4 mr-2" />
                            Send Friend Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
