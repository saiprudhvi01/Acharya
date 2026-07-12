"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, MonitorUp, Users, Copy, Check } from "lucide-react";

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [copied, setCopied] = useState(false);
  const [meetingTime, setMeetingTime] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" }
    ]
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userData);
    setUserName(user.name);
    setUserRole(user.role);

    // Check if user has advanced subscription (for students)
    if (user.role === "student" && user.subscriptionPlan !== "premium") {
      alert("This feature requires a Premium subscription");
      router.push("/student");
      return;
    }

    // Connect to Socket.IO server
    const socketInstance = io("http://localhost:3000");
    setSocket(socketInstance);

    // Get local media stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch(err => console.error("Error accessing media devices:", err));

    // Join room
    socketInstance.emit("join-room", {
      roomId,
      userId: user.id,
      userName: user.name,
      role: user.role
    });

    // Socket event listeners
    socketInstance.on("user-joined", ({ socketId, userId, userName, role }) => {
      setParticipants(prev => [...prev, { socketId, userId, userName, role }]);
      createPeerConnection(socketId, true);
    });

    socketInstance.on("existing-participants", (participants) => {
      setParticipants(participants);
      participants.forEach((p: any) => createPeerConnection(p.socketId, false));
    });

    socketInstance.on("offer", async ({ offer, from }) => {
      const pc = peerConnectionsRef.current.get(from);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketInstance.emit("answer", { roomId, answer, to: from });
      }
    });

    socketInstance.on("answer", async ({ answer, from }) => {
      const pc = peerConnectionsRef.current.get(from);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socketInstance.on("ice-candidate", async ({ candidate, from }) => {
      const pc = peerConnectionsRef.current.get(from);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socketInstance.on("user-left", ({ socketId }) => {
      setParticipants(prev => prev.filter(p => p.socketId !== socketId));
      const pc = peerConnectionsRef.current.get(socketId);
      if (pc) {
        pc.close();
        peerConnectionsRef.current.delete(socketId);
      }
    });

    socketInstance.on("chat-message", ({ message, userName, timestamp }) => {
      setChatMessages(prev => [...prev, { message, userName, timestamp }]);
    });

    socketInstance.on("user-muted", ({ socketId, isMuted, userName }) => {
      setParticipants((prev: any[]) => prev.map((p: any) => 
        p.socketId === socketId ? { ...p, isMuted } : p
      ));
    });

    socketInstance.on("user-camera-off", ({ socketId, isOff, userName }) => {
      setParticipants((prev: any[]) => prev.map((p: any) => 
        p.socketId === socketId ? { ...p, isCameraOff: isOff } : p
      ));
    });

    // Start meeting timer
    timerRef.current = setInterval(() => {
      setMeetingTime(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      peerConnectionsRef.current.forEach(pc => pc.close());
      socketInstance.disconnect();
    };
  }, [roomId, router]);

  const createPeerConnection = async (socketId: string, isCaller: boolean) => {
    const pc = new RTCPeerConnection(configuration);
    peerConnectionsRef.current.set(socketId, pc);

    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("ice-candidate", { roomId, candidate: event.candidate, to: socketId });
      }
    };

    pc.ontrack = (event) => {
      const remoteVideo = document.createElement("video");
      remoteVideo.autoplay = true;
      remoteVideo.srcObject = event.streams[0];
      remoteVideosRef.current.set(socketId, remoteVideo);
      
      // Add to DOM
      const container = document.getElementById("remote-videos");
      if (container) {
        container.appendChild(remoteVideo);
      }
    };

    if (isCaller) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket?.emit("offer", { roomId, offer, to: socketId });
    }
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        socket?.emit("toggle-mute", { roomId, isMuted: !audioTrack.enabled, userName });
      }
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
        socket?.emit("toggle-camera", { roomId, isOff: !videoTrack.enabled, userName });
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        
        peerConnectionsRef.current.forEach(pc => {
          const videoTrack = screenStream.getVideoTracks()[0];
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        setIsScreenSharing(true);
        
        screenStream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };
      } else {
        stopScreenShare();
      }
    } catch (err) {
      console.error("Error sharing screen:", err);
    }
  };

  const stopScreenShare = () => {
    if (localStream) {
      peerConnectionsRef.current.forEach(pc => {
        const videoTrack = localStream.getVideoTracks()[0];
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
      
      setIsScreenSharing(false);
    }
  };

  const leaveMeeting = () => {
    if (socket) {
      socket.emit("leave-room", { roomId });
    }
    router.back();
  };

  const sendChatMessage = () => {
    if (chatInput.trim() && socket) {
      socket.emit("chat-message", { roomId, message: chatInput, userName });
      setChatInput("");
    }
  };

  const copyMeetingLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-white text-xl font-bold">Acharya Meet</h1>
          <div className="bg-slate-700 px-4 py-2 rounded-lg flex items-center gap-2">
            <span className="text-slate-300 text-sm">Room:</span>
            <span className="text-white font-mono">{roomId}</span>
            <button onClick={copyMeetingLink} className="text-slate-400 hover:text-white transition-colors">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <div className="text-white font-mono">{formatTime(meetingTime)}</div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowChat(!showChat)}
            className="p-2 bg-slate-700 rounded-lg text-white hover:bg-slate-600 transition-colors relative"
          >
            <MessageSquare size={20} />
            {chatMessages.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {chatMessages.length}
              </span>
            )}
          </button>
          <div className="bg-slate-700 px-3 py-2 rounded-lg text-white flex items-center gap-2">
            <Users size={16} />
            <span>{participants.length + 1}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Grid */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            {/* Local Video */}
            <div className="relative bg-slate-800 rounded-xl overflow-hidden">
              <video 
                ref={localVideoRef} 
                autoPlay 
                muted 
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg text-white text-sm">
                You {isMuted && <MicOff size={12} className="inline ml-1" />}
                {isCameraOff && <VideoOff size={12} className="inline ml-1" />}
              </div>
            </div>

            {/* Remote Videos */}
            <div id="remote-videos" className="relative bg-slate-800 rounded-xl overflow-hidden">
              {participants.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                  Waiting for others to join...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-white font-bold">Chat</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className="bg-slate-700 rounded-lg p-3">
                  <div className="text-indigo-400 text-sm font-medium">{msg.userName}</div>
                  <div className="text-white text-sm">{msg.message}</div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-700 text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button 
                  onClick={sendChatMessage}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-slate-800 border-t border-slate-700 px-6 py-4 flex items-center justify-center gap-4">
        <button 
          onClick={toggleMute}
          className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-red-600 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
        <button 
          onClick={toggleCamera}
          className={`p-4 rounded-full transition-colors ${isCameraOff ? 'bg-red-600 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
        >
          {isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}
        </button>
        <button 
          onClick={toggleScreenShare}
          className={`p-4 rounded-full transition-colors ${isScreenSharing ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
        >
          <MonitorUp size={24} />
        </button>
        <button 
          onClick={leaveMeeting}
          className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          <PhoneOff size={24} />
        </button>
      </div>
    </div>
  );
}
