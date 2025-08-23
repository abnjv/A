import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, where, serverTimestamp, arrayUnion, arrayRemove, limit, orderBy } from 'firebase/firestore';
import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { twMerge } from 'tailwind-merge';
import { Globe } from 'lucide-react';

// Shim for UUID
const crypto = window.crypto || window.msCrypto;
if (!crypto.randomUUID) {
  crypto.randomUUID = () => {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  };
}

// Global variables from the environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// Zustand State Management
const useStore = create(
  combine(
    {
      userId: null,
      isAuthReady: false,
      currentRoom: null,
      userProfile: null,
      rooms: [],
      roomUsers: [],
      chatMessages: [],
      liveReactions: [],
      dmMessages: [],
      selectedDMUser: null,
      typingUsers: {},
      isTyping: false,
      darkMode: true,
      isMicOn: false,
      voiceChatUsers: [],
    },
    (set) => ({
      setUserId: (id) => set({ userId: id }),
      setAuthReady: (ready) => set({ isAuthReady: ready }),
      setCurrentRoom: (room) => set({ currentRoom: room }),
      setUserProfile: (profile) => set({ userProfile: profile }),
      setRooms: (rooms) => set({ rooms }),
      setRoomUsers: (users) => set({ roomUsers: users }),
      setChatMessages: (messages) => set({ chatMessages: messages }),
      setLiveReactions: (reactions) => set({ liveReactions: reactions }),
      setDMMessages: (messages) => set({ dmMessages: messages }),
      setSelectedDMUser: (user) => set({ selectedDMUser: user }),
      setTypingUsers: (users) => set({ typingUsers: users }),
      setIsTyping: (typing) => set({ isTyping: typing }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setIsMicOn: (on) => set({ isMicOn: on }),
      setVoiceChatUsers: (users) => set({ voiceChatUsers: users }),
    })
  )
);

// Utility function for conditional classes
const cn = (...classes) => twMerge(classes);

// Dummy UI components to replace shadcn/ui.
const Button = React.forwardRef(({ className, variant, size, children, loading, disabled, ...props }, ref) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:pointer-events-none",
      {
        // Default variant
        "bg-purple-600 text-white shadow-lg hover:bg-purple-700 focus-visible:ring-purple-500 focus-visible:ring-offset-gray-950": variant === 'default' || !variant,
        // Secondary variant
        "bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700 focus-visible:ring-gray-500 focus-visible:ring-offset-gray-950": variant === 'secondary',
        // Destructive variant
        "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 focus-visible:ring-offset-gray-950": variant === 'destructive',
        // Ghost variant
        "bg-transparent text-gray-400 hover:bg-gray-800 focus-visible:ring-gray-500 focus-visible:ring-offset-gray-950": variant === 'ghost',
        // Neon variant (NEW)
        "bg-transparent text-purple-400 border-2 border-purple-400 hover:bg-purple-400 hover:text-gray-950 transition-all duration-300 shadow-[0_0_10px_#a855f7,0_0_20px_#a855f7] hover:shadow-none focus-visible:ring-purple-400 focus-visible:ring-offset-gray-950": variant === 'neon',
        // Sizes
        "h-10 py-2 px-4": size === 'default' || !size,
        "h-9 px-3": size === 'sm',
        "h-11 px-8": size === 'lg',
        "h-10 w-10 p-0": size === 'icon',
      },
      className
    )}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? <Icons.spinner className="h-4 w-4 animate-spin" /> : children}
  </motion.button>
));

const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-2 text-sm text-white",
      "file:border-0 file:bg-transparent file:text-sm file:font-medium",
      "placeholder:text-gray-500",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
));

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300",
      className
    )}
    {...props}
  />
));

const Dialog = ({ children, open, onOpenChange, ...props }) => (
  <AnimatePresence>
    {open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black"
          onClick={() => onOpenChange(false)}
        />
        {children}
      </div>
    )}
  </AnimatePresence>
);
const DialogTrigger = ({ children, ...props }) => <span {...props}>{children}</span>;
const DialogContent = ({ children, className, ...props }) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.9, opacity: 0 }}
    className={cn("bg-gray-900 border border-gray-700 rounded-3xl p-8 relative z-50 w-full max-w-lg", className)}
    {...props}
  >
    {children}
  </motion.div>
);
const DialogHeader = ({ children, className, ...props }) => (
  <div className={cn("text-center space-y-2 mb-4", className)} {...props}>{children}</div>
);
const DialogTitle = ({ children, className, ...props }) => (
  <h2 className={cn("text-2xl font-bold text-white", className)} {...props}>{children}</h2>
);

const Popover = ({ children, open, onOpenChange, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
    if (onOpenChange) {
      onOpenChange(!isOpen);
    }
  };

  const handleClickOutside = useCallback((event) => {
    if (triggerRef.current && !triggerRef.current.contains(event.target) &&
        contentRef.current && !contentRef.current.contains(event.target)) {
      setIsOpen(false);
      if (onOpenChange) {
        onOpenChange(false);
      }
    }
  }, [onOpenChange]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const trigger = React.Children.toArray(children).find(child => child.type === PopoverTrigger);
  const content = React.Children.toArray(children).find(child => child.type === PopoverContent);

  return (
    <div className="relative inline-block">
      <div ref={triggerRef} onClick={handleToggle}>{trigger?.props.children}</div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={contentRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute z-50 mt-2 rounded-xl shadow-lg bg-gray-900 border border-gray-700 right-0"
            {...props}
          >
            {content?.props.children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
const PopoverTrigger = ({ children }) => <>{children}</>;
const PopoverContent = ({ children, className }) => <div className={cn("p-4", className)}>{children}</div>;

const Avatar = ({ children, className }) => <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}>{children}</div>;
const AvatarImage = ({ src, alt }) => <img src={src} alt={alt} className="aspect-square h-full w-full" />;
const AvatarFallback = ({ children }) => <div className="flex h-full w-full items-center justify-center bg-gray-600 text-white">{children}</div>;


// Icons
const Icons = {
  spinner: (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>),
  send: (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m22 2-7 19-3-9-9-3 19-7z" /><path d="M22 2 11 13" /></svg>),
  mic: (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>),
  exit: (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>),
  user: (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>),
  lock: (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>),
  key: (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 2l-2 2" /><path d="M5.88 15.88a2.4 2.4 0 0 1 0-3.39l7.99-7.99a2.4 2.4 0 0 1 3.4 0l1.99 1.99a2.4 2.4 0 0 1 0 3.39L14.3 19.3a2.4 2.4 0 0 1-3.4 0l-.99-.99a2.4 2.4 0 0 1 0-3.4L8.5 10.5" /></svg>),
  settings: (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.22a2 2 0 0 1-1.42 1.42l-.22.22a2 2 0 0 0-2.42 1.25l-.22.7a2 2 0 0 0 .91 2.37l.22.19a2 2 0 0 1 1.42 1.42l.22.22a2 2 0 0 0 1.25 2.42l.7.22a2 2 0 0 0 2.37-.91l.19-.22a2 2 0 0 1 1.42-1.42l.22-.22a2 2 0 0 0 2.42-1.25l.22-.7a2 2 0 0 0-.91-2.37l-.19-.22a2 2 0 0 1-1.42-1.42l-.22-.22a2 2 0 0 0-1.25-2.42z" /><circle cx="12" cy="12" r="3" /></svg>),
  trophy: (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4.5 9A2.5 2.5 0 0 1 7 11.5V13h9v-.5A2.5 2.5 0 0 1 18.5 9" /><path d="M12 17.5V3" /><path d="M12 17.5H6.5" /><path d="M12 17.5H17.5" /><path d="M12 21.5L10 19.5" /><path d="M12 21.5L14 19.5" /></svg>),
  plus: (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14" /><path d="M12 5v14" /></svg>),
  check: (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12" /></svg>),
  x: (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>),
  heart: (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>),
  laugh: (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><path d="M18 13a6 6 0 0 1-6 5 6 6 0 0 1-6-5" /><line x1="9" x2="9.01" y1="9" y2="9" /><line x1="15" x2="15.01" y1="9" y2="9" /></svg>),
  star: (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>),
  dm: (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 12A10 10 0 0 0 12 2a10 10 0 0 0-7.3 3.5c-.3.4-.6.8-.8 1.2a1 1 0 0 0 .8 1.8h.2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H5.5a.5.5 0 0 0-.4.8L7.8 19c.4.7 1.3 1.2 2.2 1.2H12a10 10 0 0 0 10-10Z" /><path d="M2 12a10 10 0 0 0 10 10h.2c.9 0 1.7-.5 2.2-1.2l3.4-5.8a.5.5 0 0 0-.4-.8h-.2a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h.2a1 1 0 0 0 .8-1.8c-.2-.4-.5-.8-.8-1.2A10 10 0 0 0 2 12Z" /></svg>),
  pinned: (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 17.5V3" /><path d="M12 21.5L10 19.5" /><path d="M12 21.5L14 19.5" /><path d="M12 17.5H6.5" /><path d="M12 17.5H17.5" /></svg>),
  edit: (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="M15 5l4 4" /></svg>),
  trash: (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>),
  image: (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>),
  globe: (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>),
  moon: (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>),
  sun: (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m4.93 19.07 1.41-1.41" /><path d="m17.66 6.34 1.41-1.41" /></svg>),
};

// --- New Voice Chat Component ---
const VoiceChat = ({ roomId, darkMode }) => {
  const { userId, userProfile, isMicOn, voiceChatUsers, setIsMicOn, setVoiceChatUsers } = useStore();
  const voiceChatRef = collection(db, 'artifacts', appId, 'public', 'data', 'air_chat_voice_chats');

  // Firebase listener for voice chat users in this specific room
  useEffect(() => {
    const q = query(voiceChatRef, where('roomId', '==', roomId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVoiceChatUsers(users);
    });
    return () => unsubscribe();
  }, [roomId, setVoiceChatUsers, voiceChatRef]);

  // Handle a user toggling their microphone on/off
  const handleToggleMic = async () => {
    try {
      if (isMicOn) {
        // User wants to turn off the mic, remove their entry from the voice chat collection
        await updateDoc(doc(voiceChatRef, userId), {
          isMicOn: false,
          roomId: null,
          lastSpoke: serverTimestamp(),
        });
        setIsMicOn(false);
        toast.success('تم إيقاف المايك.');
      } else {
        // User wants to turn on the mic, add their entry or update it
        await setDoc(doc(voiceChatRef, userId), {
          userId,
          roomId,
          displayName: userProfile.displayName,
          isMicOn: true,
          lastSpoke: serverTimestamp(),
          avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${userId}`,
        }, { merge: true });
        setIsMicOn(true);
        toast.success('تم تشغيل المايك.');
      }
    } catch (error) {
      console.error("Error toggling mic state:", error);
      toast.error('فشل في التحكم بالمايك.');
    }
  };

  const activeUsers = voiceChatUsers.filter(user => user.isMicOn);
  const totalUsers = activeUsers.length;
  const micOnClass = isMicOn ? 'bg-purple-600' : 'bg-gray-800';

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-900 rounded-3xl border border-gray-700 shadow-xl">
      <h2 className="text-xl font-bold mb-4 text-white">غرفة المايكات (🎙️ {totalUsers})</h2>

      {/* The Circular Layout */}
      <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mb-6">
        <div className="absolute w-full h-full rounded-full border border-dashed border-gray-600 animate-spin-slow" />
        <AnimatePresence>
          {activeUsers.map((user, index) => {
            const angle = (360 / totalUsers) * index;
            const radius = 120; // Radius of the circle
            const x = radius * Math.cos(angle * Math.PI / 180);
            const y = radius * Math.sin(angle * Math.PI / 180);

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="absolute"
                style={{ transform: `translate(${x}px, ${y}px)` }}
              >
                <div className="relative group">
                  <Avatar className="h-14 w-14 border-2 border-purple-500 shadow-lg">
                    <AvatarImage src={user.avatar} alt={user.displayName} />
                    <AvatarFallback>{user.displayName.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    {user.displayName}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Mic Control Button */}
      <Button
        variant="default"
        size="lg"
        onClick={handleToggleMic}
        className={cn(micOnClass, 'px-8 py-3 transition-colors duration-200')}
      >
        <Icons.mic className="h-6 w-6 mr-2" />
        {isMicOn ? 'إيقاف المايك' : 'تشغيل المايك'}
      </Button>
    </div>
  );
};

// NEW: Live Reactions Component
const LiveReactions = ({ reactions, darkMode }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {reactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            initial={{ y: 0, opacity: 1, scale: 0.5 }}
            animate={{ y: -200, opacity: 0, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute z-50 text-4xl"
            style={{
              left: reaction.position.x,
              top: reaction.position.y,
              color: reaction.emoji === '❤️' ? 'red' : reaction.emoji === '😂' ? 'yellow' : 'white',
              textShadow: '0 0 5px rgba(0,0,0,0.5)',
            }}
          >
            {reaction.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};


// Main App Component
const App = () => {
  const { userId, isAuthReady, currentRoom, userProfile, selectedDMUser, setUserId, setAuthReady, setCurrentRoom, setUserProfile, setSelectedDMUser, darkMode, toggleDarkMode } = useStore();

  useEffect(() => {
    // Sign in the user with the provided custom token or anonymously
    const signIn = async () => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Firebase sign-in failed:", error);
        toast.error("فشل تسجيل الدخول. يرجى تحديث الصفحة.");
      }
    };

    if (firebaseConfig && !auth.currentUser) {
      signIn();
    }
  }, [initialAuthToken]);

  useEffect(() => {
    // Listen for auth state changes to get the user ID and set up presence
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'air_chat_users', user.uid);
        const userDoc = await getDoc(userRef);

        const userData = userDoc.exists() ? userDoc.data() : {};
        const displayName = userData.displayName || `مستخدم ${user.uid.slice(0, 5)}`;
        const bio = userData.bio || '';
        const status = userData.status || 'متصل';
        const messagesSent = userData.messagesSent || 0;
        const roomsCreated = userData.roomsCreated || [];
        const isOnline = true;

        await setDoc(userRef, { lastSeen: serverTimestamp(), isOnline, displayName, bio, status, messagesSent, roomsCreated }, { merge: true });

        // Listen to user profile changes
        const unsubscribeProfile = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setUserProfile({
              displayName: data.displayName,
              isOnline: data.isOnline,
              bio: data.bio || '',
              status: data.status || 'متصل',
              messagesSent: data.messagesSent || 0,
              roomsCreated: data.roomsCreated || [],
            });
          }
        });

        setAuthReady(true);
        return () => unsubscribeProfile();
      } else {
        setAuthReady(false);
      }
    });

    return () => unsubscribeAuth();
  }, [setUserId, setUserProfile, setAuthReady]);

  useEffect(() => {
    // Handle user disconnect (presence)
    const handleBeforeUnload = async () => {
      if (userId) {
        const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'air_chat_users', userId);
        await updateDoc(userRef, { isOnline: false, lastSeenOnline: serverTimestamp() });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [userId]);

  const handleJoinRoom = async (room) => {
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'air_chat_rooms', room.id);
    const roomDoc = await getDoc(roomRef);
    if (roomDoc.exists() && roomDoc.data().bannedUsers?.includes(userId)) {
      toast.error('لقد تم حظرك من هذه الغرفة.');
      return;
    }
    setCurrentRoom(room);
    setSelectedDMUser(null);
    if (userId) {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'air_chat_users', userId), {
        currentRoomId: room.id,
      });
      toast.success(`انضممت إلى غرفة ${room.roomName}`);
    }
  };

  const handleLeaveRoom = async () => {
    setCurrentRoom(null);
    setSelectedDMUser(null);
    if (userId) {
      // Also turn off the mic when leaving the room
      const { isMicOn } = useStore.getState();
      if (isMicOn) {
        const voiceChatRef = collection(db, 'artifacts', appId, 'public', 'data', 'air_chat_voice_chats');
        await updateDoc(doc(voiceChatRef, userId), {
          isMicOn: false,
          roomId: null,
          lastSpoke: serverTimestamp(),
        });
        useStore.getState().setIsMicOn(false);
      }

      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'air_chat_users', userId), {
        currentRoomId: null,
      });
      toast.success('لقد غادرت الغرفة.');
    }
  };

  const handleStartDM = (user) => {
    setSelectedDMUser(user);
    toast.success(`بدأت محادثة مع ${user.displayName}`);
  };

  if (!isAuthReady || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <Icons.spinner className="h-8 w-8 animate-spin text-purple-400" />
        <span className="mr-2">جاري التحميل...</span>
      </div>
    );
  }

  const mainBgClass = darkMode ? "bg-gray-950" : "bg-gray-50";
  const contentBgClass = darkMode ? "bg-gray-900/80" : "bg-white/80";
  const headerBgClass = darkMode ? "bg-gray-900/60 border-b-gray-700" : "bg-gray-100/60 border-b-gray-300";
  const neonTextClass = darkMode ? "neon-blue-text" : "text-gray-800";
  const contentPanelClass = darkMode ? "bg-gray-900/70 border-gray-700 shadow-inner" : "bg-white/70 border-gray-300 shadow-inner-light";

  return (
    <div className={cn("min-h-screen flex items-center justify-center p-4 antialiased font-sans transition-colors duration-300", mainBgClass)}>
      <div className={cn("rounded-[3rem] shadow-2xl overflow-hidden w-full max-w-7xl h-[95vh] flex flex-col border", contentBgClass, darkMode ? "border-purple-800" : "border-purple-300")}>
        <Toaster position="top-center" reverseOrder={false} />

        {/* Header Section */}
        <div className={cn("p-6 flex items-center justify-between border-b shadow-md transition-colors duration-300", headerBgClass)}>
          <h1 className={cn("text-3xl font-black tracking-wider", neonTextClass)}>AirChat</h1>
          <div className="flex items-center space-x-4 space-x-reverse">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="icon" onClick={toggleDarkMode} className={darkMode ? "text-purple-400" : "text-gray-600"}>
                {darkMode ? <Icons.sun className="h-6 w-6" /> : <Icons.moon className="h-6 w-6" />}
              </Button>
            </motion.div>
            <UserProfilePopover userId={userId} userProfile={userProfile} />
            <span className={cn("font-mono text-xs md:text-sm hidden md:block", darkMode ? "text-gray-500" : "text-gray-500")}>معرّف المستخدم: {userId}</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex p-6">
          {!currentRoom ? (
            <Lobby onJoinRoom={handleJoinRoom} darkMode={darkMode} />
          ) : (
            selectedDMUser ? (
              <DMChat dmUser={selectedDMUser} onBackToRoom={() => setSelectedDMUser(null)} darkMode={darkMode} />
            ) : (
              <Room room={currentRoom} onLeaveRoom={handleLeaveRoom} onStartDM={handleStartDM} darkMode={darkMode} />
            )
          )}
        </div>

      </div>
    </div>
  );
};

const UserProfilePopover = ({ userId, userProfile }) => {
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [status, setStatus] = useState(userProfile?.status || 'متصل');
  const [loading, setLoading] = useState(false);
  const { darkMode } = useStore();
  const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'air_chat_users', userId);

  const handleUpdateProfile = async () => {
    if (displayName.trim()) {
      setLoading(true);
      try {
        await updateDoc(userRef, { displayName, bio, status });
        toast.success('تم تحديث ملفك الشخصي بنجاح.');
      } catch (error) {
        console.error('Error updating profile:', error);
        toast.error('فشل في تحديث الملف الشخصي.');
      } finally {
        setLoading(false);
      }
    }
  };

  const getBadges = () => {
    const badges = [];
    if (userProfile.roomsCreated && userProfile.roomsCreated.length > 0) {
      badges.push({ name: 'المؤسس', color: 'bg-yellow-500' });
    }
    if (userProfile.messagesSent > 50) {
      badges.push({ name: 'متحدث نشط', color: 'bg-green-500' });
    }
    return badges;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button variant="ghost" className="relative h-12 w-12 rounded-full p-0">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${userId}`} alt="User Avatar" />
              <AvatarFallback>{displayName.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className={cn("absolute bottom-0 right-0 w-3 h-3 rounded-full border-2", darkMode ? "border-gray-900" : "border-white", {
              "bg-green-500": userProfile.isOnline, "bg-red-500": !userProfile.isOnline
            })} />
          </Button>
        </motion.div>
      </PopoverTrigger>
      <PopoverContent className={cn("w-80 rounded-2xl p-6", darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-800")}>
        <div className="flex flex-col space-y-4">
          <h3 className="text-xl font-bold leading-none mb-2">ملفي الشخصي</h3>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="displayName">الاسم المستعار</Label>
            <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="اسمك المستعار" className={darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-200 border-gray-300 text-gray-800"} />
            <Label htmlFor="bio">الوصف</Label>
            <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="اكتب وصفاً مختصراً عنك" className={cn("rounded-xl p-2 min-h-[80px]", darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-200 border-gray-300 text-gray-800")} />
            <Label htmlFor="status">الحالة</Label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className={cn("rounded-xl p-2", darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-200 border-gray-300 text-gray-800")}>
              <option value="متصل">متصل</option>
              <option value="مشغول">مشغول</option>
              <option value="غير متصل">غير متصل</option>
            </select>
            <Button onClick={handleUpdateProfile} loading={loading} className="mt-2 w-full">
              {loading ? "" : "حفظ التغييرات"}
            </Button>
          </div>
          <div className={cn("mt-4 pt-4", darkMode ? "border-t border-gray-600" : "border-t border-gray-300")}>
            <h4 className="text-md font-semibold mb-2">إحصائياتي</h4>
            <div className="flex flex-col space-y-2 text-sm">
              <p>الرسائل المرسلة: <span className="font-bold text-purple-400">{userProfile.messagesSent}</span></p>
              <p>الغرف التي أنشأتها: <span className="font-bold text-purple-400">{userProfile.roomsCreated?.length || 0}</span></p>
            </div>
          </div>
          <div className={cn("mt-4 pt-4", darkMode ? "border-t border-gray-600" : "border-t border-gray-300")}>
            <h4 className="text-md font-semibold mb-2">شاراتي</h4>
            <div className="flex flex-wrap gap-2">
              {getBadges().map(badge => (
                <span key={badge.name} className={cn("inline-block text-white text-xs px-2 py-1 rounded-full", badge.color)}>
                  {badge.name}
                </span>
              ))}
              {getBadges().length === 0 && <span className={cn("text-sm", darkMode ? "text-gray-500" : "text-gray-500")}>لا توجد شارات حالياً.</span>}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const RoomThemePicker = ({ selectedColor, onColorChange, darkMode }) => {
  const colors = [
    '#6b21a8', // purple
    '#1d4ed8', // blue
    '#0d9488', // teal
    '#be185d', // pink
    '#f59e0b', // yellow
    '#4b5563', // gray
  ];

  return (
    <div className="flex space-x-2 space-x-reverse">
      {colors.map(color => (
        <motion.div
          key={color}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={cn(
            'w-8 h-8 rounded-full border-2 cursor-pointer transition-all',
            selectedColor === color ? `ring-2 ring-offset-2 ring-purple-500 ring-offset-${darkMode ? 'gray-950' : 'white'}` : ''
          )}
          style={{ backgroundColor: color }}
          onClick={() => onColorChange(color)}
        />
      ))}
    </div>
  );
};

const RoomSettingsDialog = ({ room, onUpdate, darkMode }) => {
  const [roomName, setRoomName] = useState(room.roomName);
  const [themeColor, setThemeColor] = useState(room.themeColor);
  const [loading, setLoading] = useState(false);
  const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'air_chat_rooms', room.id);

  const handleUpdate = async () => {
    if (roomName.trim()) {
      setLoading(true);
      try {
        await updateDoc(roomRef, { roomName, themeColor });
        onUpdate({ ...room, roomName, themeColor });
        toast.success('تم تحديث إعدادات الغرفة.');
      } catch (error) {
        console.error('Error updating room:', error);
        toast.error('فشل في تحديث إعدادات الغرفة.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Icons.settings className={darkMode ? "h-6 w-6 text-gray-400" : "h-6 w-6 text-gray-600"} />
        </Button>
      </DialogTrigger>
      <DialogContent className={cn("sm:max-w-md", darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-300")}>
        <DialogHeader>
          <DialogTitle className={darkMode ? "text-white" : "text-gray-800"}>إعدادات الغرفة</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="room-name">اسم الغرفة</Label>
            <Input id="room-name" value={roomName} onChange={(e) => setRoomName(e.target.value)} className={darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-200 border-gray-300 text-gray-800"} />
          </div>
          <div className="grid gap-2">
            <Label>لون الغرفة</Label>
            <RoomThemePicker selectedColor={themeColor} onColorChange={setThemeColor} darkMode={darkMode} />
          </div>
          <Button onClick={handleUpdate} loading={loading} className="w-full">
            {loading ? "" : "حفظ التغييرات"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Lobby = ({ onJoinRoom, darkMode }) => {
  const { userId, userProfile, rooms, setRooms } = useStore();
  const [newRoomName, setNewRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const roomsCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'air_chat_rooms');

  // Listen to rooms changes
  useEffect(() => {
    const unsubscribe = onSnapshot(roomsCollectionRef, (snapshot) => {
      const roomsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRooms(roomsList);
    });
    return () => unsubscribe();
  }, [setRooms, roomsCollectionRef]);

  const handleCreateRoom = async () => {
    if (newRoomName.trim() === '') {
      toast.error('اسم الغرفة لا يمكن أن يكون فارغاً.');
      return;
    }
    setLoading(true);
    try {
      const newRoomRef = await addDoc(roomsCollectionRef, {
        roomName: newRoomName,
        createdAt: serverTimestamp(),
        creatorId: userId,
        themeColor: '#6b21a8',
        isPrivate: false,
        bannedUsers: [],
      });
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'air_chat_users', userId), {
        roomsCreated: arrayUnion(newRoomRef.id),
      });
      setNewRoomName('');
      toast.success(`تم إنشاء غرفة "${newRoomName}"`);
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('فشل في إنشاء الغرفة.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId, roomName) => {
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'air_chat_rooms', roomId));
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'air_chat_users', userId), {
        roomsCreated: arrayRemove(roomId),
      });
      toast.success(`تم حذف غرفة "${roomName}"`);
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('فشل في حذف الغرفة.');
    }
  };

  const canDeleteRoom = (room) => room.creatorId === userId;
  const isCreator = (room) => room.creatorId === userId;

  const mainClasses = cn(
    "flex-1 flex flex-col p-6 rounded-3xl",
    darkMode ? "bg-gray-900/70 border border-gray-700 shadow-inner" : "bg-white/70 border border-gray-300 shadow-inner-light"
  );
  const roomCardClasses = cn(
    "flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-transform duration-200 hover:scale-[1.02]",
    darkMode ? "bg-gray-800 text-white border border-gray-700" : "bg-gray-100 text-gray-800 border border-gray-300"
  );

  return (
    <div className={mainClasses}>
      <h2 className="text-2xl font-bold mb-4 text-purple-400">القاعات المتاحة</h2>
      <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.length > 0 ? (
          rooms.map(room => (
            <div
              key={room.id}
              onClick={() => onJoinRoom(room)}
              className="relative flex flex-col items-center justify-center p-6 rounded-2xl bg-gray-800 border border-gray-700 shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 hover:bg-gray-700 cursor-pointer"
            >
              {canDeleteRoom(room) && (
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room.id, room.roomName); }}>
                  <Icons.trash className="h-4 w-4 text-red-500" />
                </Button>
              )}

              <div
                className="p-4 rounded-full mb-4"
                style={{
                  backgroundColor: room.themeColor || '#8B5CF6',
                  boxShadow: `0 0 15px ${room.themeColor || '#8B5CF6'}`
                }}
              >
                <Globe size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-1">{room.roomName}</h3>
              <p className="text-sm font-light text-gray-400">
                {isCreator(room) ? 'أنت المؤسس' : `تم الإنشاء بواسطة ${room.creatorId?.slice(0, 5)}...`}
              </p>

              <div className="absolute bottom-2 left-2 flex items-center space-x-1 text-xs text-gray-400">
                  <Icons.user className="h-4 w-4" />
                  <span>{room.users?.length || 0}</span>
              </div>
            </div>
          ))
        ) : (
          <p className={cn("text-center py-8", darkMode ? "text-gray-400" : "text-gray-600")}>لا توجد قاعات حالياً. كن أول من ينشئ واحدة!</p>
        )}
      </div>
      <div className={cn("mt-6 pt-4 border-t", darkMode ? "border-t-gray-700" : "border-t-gray-300")}>
        <h3 className="text-xl font-bold mb-2 text-purple-400">أنشئ قاعة جديدة</h3>
        <div className="flex space-x-2 space-x-reverse">
          <Input
            placeholder="اسم القاعة"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateRoom();
            }}
            className={darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-200 border-gray-300 text-gray-800"}
          />
          <Button onClick={handleCreateRoom} loading={loading} disabled={!newRoomName.trim()}>
            {loading ? "" : <Icons.plus className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};


const Room = ({ room, onLeaveRoom, onStartDM, darkMode }) => {
  const { userId, roomUsers, chatMessages, isTyping, typingUsers, userProfile, setRoomUsers, setChatMessages, setTypingUsers, setIsTyping, liveReactions, setLiveReactions } = useStore();
  const [message, setMessage] = useState('');
  const chatMessagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const isRoomCreator = room.creatorId === userId;
  const contentPanelClass = darkMode ? "bg-gray-900/70 border-gray-700 shadow-inner" : "bg-white/70 border-gray-300 shadow-inner-light";
  const userListClass = darkMode ? "bg-gray-900/70 border-gray-700" : "bg-white/70 border-gray-300";

  // Firestore listeners
  useEffect(() => {
    // Listen to users in the current room
    const usersQ = query(collection(db, 'artifacts', appId, 'public', 'data', 'air_chat_users'), where('currentRoomId', '==', room.id));
    const unsubscribeUsers = onSnapshot(usersQ, (snapshot) => {
      const usersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRoomUsers(usersList);
    });

    // Listen to chat messages for the current room, ordered by timestamp
    const messagesQ = query(collection(db, 'artifacts', appId, 'public', 'data', 'air_chat_messages'), where('roomId', '==', room.id), orderBy('timestamp', 'asc'));
    const unsubscribeMessages = onSnapshot(messagesQ, (snapshot) => {
      const messagesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChatMessages(messagesList);
    });

    // Listen for typing status
    const typingRef = doc(db, 'artifacts', appId, 'public', 'data', 'air_chat_typing', userId);
    const typingUnsubscribe = onSnapshot(typingRef, (doc) => {
      if (doc.exists() && doc.data().isTyping && doc.data().roomId === room.id) {
        // Here we don't do anything because the user is typing, not listening to others
      }
    });

    // NEW: Listen for live reactions
    const liveReactionsQ = query(collection(db, 'artifacts', appId, 'public', 'data', 'air_chat_live_reactions'), where('roomId', '==', room.id), orderBy('timestamp', 'desc'), limit(1));
    const unsubscribeReactions = onSnapshot(liveReactionsQ, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const newReaction = { id: change.doc.id, ...change.doc.data() };
          setLiveReactions(prev => [...prev, newReaction]);
          // Auto-remove reaction after a few seconds
          setTimeout(() => {
            setLiveReactions(prev => prev.filter(r => r.id !== newReaction.id));
          }, 3000);
        }
      });
    });

    return () => {
      unsubscribeUsers();
      unsubscribeMessages();
      typingUnsubscribe();
      unsubscribeReactions();
    };
  }, [room.id, setRoomUsers, setChatMessages, setTypingUsers, userId, setLiveReactions]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (message.trim() === '') return;

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'air_chat_messages'), {
        text: message,
        timestamp: serverTimestamp(),
        userId,
        displayName: userProfile.displayName,
        roomId: room.id,
        isPinned: false, // NEW: Add isPinned field
      });

      // Update message count for user profile
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'air_chat_users', userId), {
        messagesSent: (userProfile.messagesSent || 0) + 1
      });

      setMessage('');
      setIsTyping(false);
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'air_chat_typing', userId), { isTyping: false });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('فشل في إرسال الرسالة.');
    }
  };

  const handleTyping = async (e) => {
    setMessage(e.target.value);
    const isNowTyping = e.target.value.trim().length > 0;
    if (isTyping !== isNowTyping) {
      setIsTyping(isNowTyping);
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'air_chat_typing', userId), {
        userId,
        displayName: userProfile.displayName,
        roomId: room.id,
        isTyping: isNowTyping,
      }, { merge: true });
    }
  };

  // NEW: Function to send a live reaction
  const handleSendReaction = async (emoji) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.random() * rect.width;
    const y = rect.height - 50;

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'air_chat_live_reactions'), {
        emoji,
        timestamp: serverTimestamp(),
        userId,
        roomId: room.id,
        position: { x, y },
      });
    } catch (error) {
      console.error('Error sending reaction:', error);
      toast.error('فشل في إرسال التفاعل.');
    }
  };

  const typingDisplay = Object.values(typingUsers).join(', ');

  const handleBanUser = async (userToBanId, displayName) => {
    if (!isRoomCreator) {
      toast.error('ليس لديك صلاحية لحظر المستخدمين.');
      return;
    }
    const confirmed = window.confirm(`هل أنت متأكد من حظر المستخدم ${displayName}?`);
    if (confirmed) {
      try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'air_chat_rooms', room.id), {
          bannedUsers: arrayUnion(userToBanId),
        });
        toast.success(`تم حظر المستخدم ${displayName} بنجاح.`);
      } catch (error) {
        console.error('Error banning user:', error);
        toast.error('فشل في حظر المستخدم.');
      }
    }
  };

  const pinnedMessages = chatMessages.filter(msg => msg.isPinned);
  const regularMessages = chatMessages.filter(msg => !msg.isPinned);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left Panel: Chat Messages */}
      <div ref={containerRef} className={cn("relative flex-1 flex flex-col p-6 rounded-3xl mr-6", contentPanelClass)}>
        <LiveReactions reactions={liveReactions} darkMode={darkMode} />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className="w-4 h-4 rounded-full" style={{ backgroundColor: room.themeColor }} />
            <h2 className="text-2xl font-bold text-purple-400">{room.roomName}</h2>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            {isRoomCreator && <RoomSettingsDialog room={room} onUpdate={useStore.getState().setCurrentRoom} darkMode={darkMode} />}
            <Button variant="ghost" onClick={onLeaveRoom}>
              <Icons.exit className="h-6 w-6 text-gray-400" />
            </Button>
          </div>
        </div>

        {/* Pinned Messages Section */}
        {pinnedMessages.length > 0 && (
          <div className={cn("mb-4 p-3 rounded-2xl border-2 border-purple-500 bg-gray-800", darkMode ? "bg-gray-800" : "bg-gray-200")}>
            <div className="flex items-center space-x-2 space-x-reverse mb-2">
              <Icons.pinned className="h-5 w-5 text-purple-400" />
              <h4 className="font-bold text-purple-400">الرسائل المثبتة</h4>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
              {pinnedMessages.map(msg => (
                <MessageItem
                  key={msg.id}
                  msg={msg}
                  isOwnMessage={msg.userId === userId}
                  isRoomCreator={isRoomCreator}
                  onStartDM={onStartDM}
                  darkMode={darkMode}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {regularMessages.map(msg => (
            <MessageItem
              key={msg.id}
              msg={msg}
              isOwnMessage={msg.userId === userId}
              isRoomCreator={isRoomCreator}
              onStartDM={onStartDM}
              darkMode={darkMode}
            />
          ))}
          <div ref={chatMessagesEndRef} />
        </div>

        {Object.keys(typingUsers).length > 0 && (
          <p className={cn("text-sm mt-2 text-gray-500", darkMode ? "text-gray-400" : "text-gray-500")}>
            {typingDisplay} يكتب...
          </p>
        )}

        {/* Reaction Buttons */}
        <div className="mt-4 flex items-center justify-center space-x-4 space-x-reverse">
            <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-2xl" onClick={() => handleSendReaction('❤️')}>❤️</Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-2xl" onClick={() => handleSendReaction('😂')}>😂</Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-2xl" onClick={() => handleSendReaction('⭐')}>⭐</Button>
            </motion.div>
          </div>

        <div className="mt-4 pt-4 border-t border-gray-700 flex space-x-2 space-x-reverse">
          <Input
            placeholder="اكتب رسالتك..."
            value={message}
            onChange={handleTyping}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className={darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-200 border-gray-300 text-gray-800"}
          />
          <Button onClick={handleSendMessage} disabled={!message.trim()}>
            <Icons.send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Right Panel: Voice Chat and Users */}
      <div className="w-1/3 flex flex-col p-6 space-y-6">
        {/* Voice Chat Component */}
        <VoiceChat roomId={room.id} darkMode={darkMode} />

        {/* User List */}
        <div className={cn("flex-1 flex flex-col rounded-3xl p-6 overflow-y-auto border", userListClass)}>
          <h3 className="text-xl font-bold mb-4 text-purple-400">مستخدمو الغرفة ({roomUsers.length})</h3>
          <ul className="space-y-4">
            {roomUsers.map(user => (
              <li key={user.id} className={cn("flex items-center space-x-4 space-x-reverse cursor-pointer p-2 rounded-xl", darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200")} onClick={() => onStartDM(user)}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.id}`} alt={user.displayName} />
                  <AvatarFallback>{user.displayName.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className={cn("font-semibold", darkMode ? "text-white" : "text-gray-800")}>{user.displayName}</p>
                  <p className={cn("text-sm", darkMode ? "text-gray-400" : "text-gray-600")}>{user.status}</p>
                </div>
                {isRoomCreator && user.id !== userId && (
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleBanUser(user.id, user.displayName); }}>
                    <Icons.x className="h-5 w-5 text-red-500" />
                  </Button>
                )}
                {user.isOnline && (
                  <div className="w-2 h-2 rounded-full bg-green-500" title="متصل" />
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const MessageItem = ({ msg, isOwnMessage, isRoomCreator, onStartDM, darkMode }) => {
  const { userId, userProfile } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(msg.text);
  const messageRef = doc(db, 'artifacts', appId, 'public', 'data', 'air_chat_messages', msg.id);

  const isDM = msg.recipientId;
  const messageClasses = cn(
    "relative p-3 rounded-2xl max-w-[80%]",
    isOwnMessage
      ? "bg-purple-600 text-white self-end rounded-br-none"
      : (isDM
        ? "bg-blue-600 text-white self-start rounded-bl-none"
        : (darkMode
          ? "bg-gray-800 text-gray-200 self-start rounded-bl-none"
          : "bg-gray-200 text-gray-800 self-start rounded-bl-none")
      ),
    isOwnMessage ? "ml-auto" : "mr-auto"
  );

  const formattedTime = msg.timestamp?.toDate().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

  // NEW: Handle message editing
  const handleEdit = async () => {
    if (editedText.trim() === '') {
      toast.error('الرسالة لا يمكن أن تكون فارغة.');
      return;
    }
    try {
      await updateDoc(messageRef, { text: editedText, editedAt: serverTimestamp() });
      setIsEditing(false);
      toast.success('تم تعديل الرسالة.');
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error('فشل في تعديل الرسالة.');
    }
  };

  // NEW: Handle message deletion
  const handleDelete = async () => {
    try {
      await deleteDoc(messageRef);
      toast.success('تم حذف الرسالة.');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('فشل في حذف الرسالة.');
    }
  };

  // NEW: Handle message pinning
  const handlePin = async () => {
    try {
      await updateDoc(messageRef, { isPinned: !msg.isPinned });
      toast.success(`الرسالة ${msg.isPinned ? 'تم فك تثبيتها' : 'تم تثبيتها'}.`);
    } catch (error) {
      console.error('Error pinning message:', error);
      toast.error('فشل في تثبيت الرسالة.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("flex group", isOwnMessage ? "justify-end" : "justify-start")}
    >
      <div className="flex flex-col">
        {!isOwnMessage && (
          <div className="flex items-center space-x-2 space-x-reverse mb-1">
            <Avatar className="h-8 w-8 cursor-pointer" onClick={() => onStartDM({ id: msg.userId, displayName: msg.displayName })}>
              <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${msg.userId}`} alt={msg.displayName} />
            </Avatar>
            <span className={cn("text-sm font-semibold", darkMode ? "text-white" : "text-gray-800")}>{msg.displayName}</span>
          </div>
        )}
        <div className={messageClasses}>
          {isEditing ? (
            <div className="flex flex-col space-y-2">
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full h-auto min-h-[60px] p-2 rounded-md text-gray-900"
                autoFocus
              />
              <div className="flex justify-end space-x-2 space-x-reverse">
                <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)}>إلغاء</Button>
                <Button variant="default" size="sm" onClick={handleEdit}>حفظ</Button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{msg.text}</p>
          )}
          <span className={cn("block text-right mt-1 text-xs opacity-70", isOwnMessage ? "text-purple-200" : "text-gray-400")}>
            {formattedTime}
            {msg.editedAt && " (تم تعديلها)"}
          </span>

          {/* Action Buttons for Messages */}
          <div className={cn("absolute top-1/2 -translate-y-1/2 flex space-x-1 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity", isOwnMessage ? "right-full mr-2" : "left-full ml-2")}>
            {isOwnMessage && (
              <>
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                  <Icons.edit className="h-4 w-4 text-gray-500 hover:text-gray-300" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleDelete}>
                  <Icons.trash className="h-4 w-4 text-red-500 hover:text-red-300" />
                </Button>
              </>
            )}
            {isRoomCreator && (
              <Button variant="ghost" size="icon" onClick={handlePin}>
                <Icons.pinned className={cn("h-4 w-4", msg.isPinned ? "text-purple-400" : "text-gray-500 hover:text-gray-300")} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};


const DMChat = ({ dmUser, onBackToRoom, darkMode }) => {
  const { userId, userProfile, dmMessages, setDMMessages } = useStore();
  const [message, setMessage] = useState('');
  const chatMessagesEndRef = useRef(null);

  const isPrivateChatWith = (msg) => (
    (msg.userId === userId && msg.recipientId === dmUser.id) ||
    (msg.userId === dmUser.id && msg.recipientId === userId)
  );

  useEffect(() => {
    // Listen for DM messages between the two users
    const messagesCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'air_chat_dm_messages');
    const q1 = query(messagesCollectionRef, where('userId', '==', userId), where('recipientId', '==', dmUser.id), orderBy('timestamp', 'asc'), limit(50));
    const q2 = query(messagesCollectionRef, where('userId', '==', dmUser.id), where('recipientId', '==', userId), orderBy('timestamp', 'asc'), limit(50));

    // Combine listeners (this is a simplified approach, a more robust solution would handle merging streams)
    const unsubscribe1 = onSnapshot(q1, (snapshot) => {
      const messages1 = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDMMessages(prev => {
        const newMessages = [...prev.filter(msg => !isPrivateChatWith(msg)), ...messages1].sort((a,b) => a.timestamp?.toMillis() - b.timestamp?.toMillis());
        return newMessages;
      });
    });

    const unsubscribe2 = onSnapshot(q2, (snapshot) => {
      const messages2 = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDMMessages(prev => {
        const newMessages = [...prev.filter(msg => !isPrivateChatWith(msg)), ...messages2].sort((a,b) => a.timestamp?.toMillis() - b.timestamp?.toMillis());
        return newMessages;
      });
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [dmUser.id, userId, setDMMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dmMessages]);

  const handleSendMessage = async () => {
    if (message.trim() === '') return;

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'air_chat_dm_messages'), {
        text: message,
        timestamp: serverTimestamp(),
        userId,
        displayName: userProfile.displayName,
        recipientId: dmUser.id,
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending DM:', error);
      toast.error('فشل في إرسال الرسالة.');
    }
  };

  const contentPanelClass = darkMode ? "bg-gray-900/70 border-gray-700 shadow-inner" : "bg-white/70 border-gray-300 shadow-inner-light";

  return (
    <div className={cn("flex-1 flex flex-col p-6 rounded-3xl", contentPanelClass)}>
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Avatar className="h-12 w-12">
            <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${dmUser.id}`} alt={dmUser.displayName} />
          </Avatar>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-purple-400">محادثة خاصة مع {dmUser.displayName}</h2>
            <p className={cn("text-sm", darkMode ? "text-gray-400" : "text-gray-600")}>معرّف المستخدم: {dmUser.id}</p>
          </div>
        </div>
        <Button variant="ghost" onClick={onBackToRoom}>
          <Icons.exit className="h-6 w-6 text-gray-400" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {dmMessages.filter(msg => isPrivateChatWith(msg)).map(msg => (
          <MessageItem key={msg.id} msg={msg} isOwnMessage={msg.userId === userId} darkMode={darkMode} />
        ))}
        <div ref={chatMessagesEndRef} />
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700 flex space-x-2 space-x-reverse">
        <Input
          placeholder="اكتب رسالتك الخاصة..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          className={darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-200 border-gray-300 text-gray-800"}
        />
        <Button onClick={handleSendMessage} disabled={!message.trim()}>
          <Icons.send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

// CSS-in-JS for better control and scoping
const style = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  body {
    font-family: 'Tajawal', sans-serif;
    background-color: #080314;
    background-image: radial-gradient(circle at 50% 10%, #4b0082 0%, transparent 50%),
                      radial-gradient(circle at 50% 90%, #6a0dad 0%, transparent 50%);
    background-size: cover;
    background-repeat: no-repeat;
    color: #d1d5db;
  }
  .container-glow {
    box-shadow: 0 0 40px rgba(93, 63, 211, 0.5);
    border: 2px solid #5d3fd3;
  }
  .neon-blue-text {
    text-shadow: 0 0 5px #00f0ff, 0 0 10px #00f0ff;
    color: #fff;
  }
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(45, 45, 77, 0.5);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(85, 85, 119, 0.7);
    border-radius: 10px;
    border: 2px solid rgba(45, 45, 77, 0.5);
  }
  .mic-speaking-glow {
    animation: pulse-pink 1.5s infinite;
  }
  @keyframes pulse-pink {
    0%, 100% {
      box-shadow: 0 0 0 0px rgba(255, 0, 200, 0.8);
    }
    50% {
      box-shadow: 0 0 0 15px rgba(255, 0, 200, a);
    }
  }
  .mic-ring {
    border: 4px solid #ff00c8;
    transform: scale(0);
  }
  .mic-speaking-ring {
    animation: ring-pulse 1.5s infinite;
  }
  @keyframes ring-pulse {
    0% {
      transform: scale(0.6);
      opacity: 0.8;
    }
    100% {
      transform: scale(1.2);
      opacity: 0;
    }
  }
`;

document.head.appendChild(document.createElement('style')).textContent = style;

export default App;
