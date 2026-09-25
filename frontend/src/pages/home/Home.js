// // // // import React, { useEffect, useMemo, useRef, useState } from 'react';
// // // // import { toast } from 'react-toastify';
// // // // import useUserStore from '../../store/useUserStore';
// // // // import useThemeStore from '../../store/useThemeStore';
// // // // import { getAllUser, logoutUser, updateUserProfile } from '../../api/authApi';
// // // // import { deleteMessage, getMessages, reactToMessage, sendMessage } from '../../api/chatApi';
// // // // import { createStatus, deleteStatus, getStatuses, markStatusViewed } from '../../api/statusApi';
// // // // import { disconnectSocket, getSocket } from '../../utils/socket';

// // // // const fallbackAvatar = (user) => `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(user?.username || user?._id || 'user')}`;
// // // // const avatarOf = (user) => user?.profilepicture || user?.profilePicture || fallbackAvatar(user);
// // // // const idOf = (value) => String(value?._id || value || '');

// // // // function formatTime(value) {
// // // //   if (!value) return '';
// // // //   const date = new Date(value);
// // // //   const now = new Date();
// // // //   if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
// // // //   return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
// // // // }

// // // // function lastSeenText(user) {
// // // //   if (user?.isOnline) return 'online';
// // // //   if (!user?.lastSeen) return 'offline';
// // // //   return `last seen ${new Date(user.lastSeen).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}`;
// // // // }

// // // // function messagePreview(item) {
// // // //   const m = item?.conversation?.lastMessage;
// // // //   if (!m) return item?.about || 'Start a conversation';
// // // //   if (m.deletedForEveryone) return 'Message deleted';
// // // //   if (m.contentType === 'image') return '📷 Photo';
// // // //   if (m.contentType === 'video') return '🎥 Video';
// // // //   return m.content || 'Message';
// // // // }

// // // // export default function Home() {
// // // //   const currentUser = useUserStore((s) => s.user);
// // // //   const setCurrentUser = useUserStore((s) => s.setUser);
// // // //   const clearUser = useUserStore((s) => s.clearUser);
// // // //   const { theme, toggleTheme } = useThemeStore();
// // // //   const [activeTab, setActiveTab] = useState('chats');
// // // //   const [users, setUsers] = useState([]);
// // // //   const [selectedUser, setSelectedUser] = useState(null);
// // // //   const selectedUserRef = useRef(null);
// // // //   const [conversationId, setConversationId] = useState(null);
// // // //   const [messages, setMessages] = useState([]);
// // // //   const [search, setSearch] = useState('');
// // // //   const [text, setText] = useState('');
// // // //   const [media, setMedia] = useState(null);
// // // //   const [sending, setSending] = useState(false);
// // // //   const [typing, setTyping] = useState(false);
// // // //   const [statuses, setStatuses] = useState([]);
// // // //   const [statusText, setStatusText] = useState('');
// // // //   const [statusMedia, setStatusMedia] = useState(null);
// // // //   const [openStatus, setOpenStatus] = useState(null);
// // // //   const [profileOpen, setProfileOpen] = useState(false);
// // // //   const [profileName, setProfileName] = useState(currentUser?.username || '');
// // // //   const [profileAbout, setProfileAbout] = useState(currentUser?.about || '');
// // // //   const [profilePhoto, setProfilePhoto] = useState(null);
// // // //   const messagesEndRef = useRef(null);
// // // //   const fileRef = useRef(null);
// // // //   const typingTimer = useRef(null);
// // // //   const socketRef = useRef(null);

// // // //   useEffect(() => { selectedUserRef.current = selectedUser; }, [selectedUser]);

// // // //   const loadUsers = async () => {
// // // //     try {
// // // //       const result = await getAllUser();
// // // //       const list = result?.data || [];
// // // //       setUsers(list);
// // // //       const selectedId = idOf(selectedUserRef.current);
// // // //       if (selectedId) {
// // // //         const fresh = list.find((u) => idOf(u) === selectedId);
// // // //         if (fresh) {
// // // //           setSelectedUser(fresh);
// // // //           selectedUserRef.current = fresh;
// // // //         }
// // // //       }
// // // //     } catch (error) {
// // // //       toast.error(error.message);
// // // //     }
// // // //   };

// // // //   const loadStatuses = async () => {
// // // //     try { setStatuses(await getStatuses()); }
// // // //     catch (error) { toast.error(error.message); }
// // // //   };

// // // //   useEffect(() => {
// // // //     loadUsers();
// // // //     loadStatuses();
// // // //     const userInterval = setInterval(loadUsers, 15000);
// // // //     return () => clearInterval(userInterval);
// // // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // // //   }, []);

// // // //   useEffect(() => {
// // // //     if (!currentUser?._id) return;
// // // //     let mounted = true;
// // // //     let socket;

// // // //     getSocket().then((s) => {
// // // //       if (!mounted) return;
// // // //       socket = s;
// // // //       socketRef.current = s;
// // // //       s.emit('user_connected', currentUser._id);

// // // //       const onReceive = (message) => {
// // // //         const peer = selectedUserRef.current;
// // // //         const peerId = idOf(peer);
// // // //         const senderId = idOf(message.sender);
// // // //         if (peerId && senderId === peerId) {
// // // //           setMessages((prev) => prev.some((m) => idOf(m) === idOf(message)) ? prev : [...prev, message]);
// // // //         }
// // // //         loadUsers();
// // // //       };
// // // //       const onUpdated = () => loadUsers();
// // // //       const onUserStatus = ({ userId, isOnline, lastSeen }) => {
// // // //         setUsers((prev) => prev.map((u) => idOf(u) === String(userId) ? { ...u, isOnline, lastSeen } : u));
// // // //         setSelectedUser((prev) => prev && idOf(prev) === String(userId) ? { ...prev, isOnline, lastSeen } : prev);
// // // //       };
// // // //       const onTyping = ({ userId, isTyping }) => {
// // // //         if (idOf(selectedUserRef.current) === String(userId)) setTyping(Boolean(isTyping));
// // // //       };
// // // //       const onReaction = (updated) => setMessages((prev) => prev.map((m) => idOf(m) === idOf(updated) ? updated : m));
// // // //       const onDeleted = ({ messageId }) => setMessages((prev) => prev.map((m) => idOf(m) === String(messageId) ? { ...m, deletedForEveryone: true, content: '', mediaUrl: '', reactions: [] } : m));
// // // //       const onStatus = () => loadStatuses();
// // // //       const onStatusUpdate = ({ messageIds, messageStatus }) => {
// // // //         const set = new Set((messageIds || []).map(String));
// // // //         setMessages((prev) => prev.map((m) => set.has(idOf(m)) ? { ...m, messageStatus } : m));
// // // //       };

// // // //       s.on('receive_message', onReceive);
// // // //       s.on('conversation_updated', onUpdated);
// // // //       s.on('user_status', onUserStatus);
// // // //       s.on('user_typing', onTyping);
// // // //       s.on('reaction_update', onReaction);
// // // //       s.on('message_deleted', onDeleted);
// // // //       s.on('status_updated', onStatus);
// // // //       s.on('message_status_update', onStatusUpdate);

// // // //       s.__cleanupWhatsapp = () => {
// // // //         s.off('receive_message', onReceive);
// // // //         s.off('conversation_updated', onUpdated);
// // // //         s.off('user_status', onUserStatus);
// // // //         s.off('user_typing', onTyping);
// // // //         s.off('reaction_update', onReaction);
// // // //         s.off('message_deleted', onDeleted);
// // // //         s.off('status_updated', onStatus);
// // // //         s.off('message_status_update', onStatusUpdate);
// // // //       };
// // // //     }).catch(() => {
// // // //       // REST polling still keeps the app usable if realtime client cannot load.
// // // //     });

// // // //     return () => {
// // // //       mounted = false;
// // // //       if (socket?.__cleanupWhatsapp) socket.__cleanupWhatsapp();
// // // //     };
// // // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // // //   }, [currentUser?._id]);

// // // //   useEffect(() => {
// // // //     // `block: 'nearest'` keeps this scroll confined to the messages list
// // // //     // itself. Without it, if the list were ever taller than its box (e.g.
// // // //     // a CSS regression), the browser could scroll an outer ancestor
// // // //     // instead, dragging the header/sidebar out of view.
// // // //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
// // // //   }, [messages, typing]);

// // // //   async function selectUser(user) {
// // // //     setSelectedUser(user);
// // // //     selectedUserRef.current = user;
// // // //     setTyping(false);
// // // //     const cid = user?.conversation?._id || null;
// // // //     setConversationId(cid);
// // // //     setMessages([]);
// // // //     if (cid) {
// // // //       try {
// // // //         const data = await getMessages(cid);
// // // //         setMessages(data);
// // // //         loadUsers();
// // // //       } catch (error) { toast.error(error.message); }
// // // //     }
// // // //   }

// // // //   async function handleSend(e) {
// // // //     e?.preventDefault();
// // // //     if (!selectedUser || (!text.trim() && !media) || sending) return;
// // // //     setSending(true);
// // // //     try {
// // // //       const result = await sendMessage(selectedUser._id, text.trim(), media);
// // // //       if (result?.message) setMessages((prev) => prev.some((m) => idOf(m) === idOf(result.message)) ? prev : [...prev, result.message]);
// // // //       if (result?.conversationId) setConversationId(String(result.conversationId));
// // // //       setText('');
// // // //       setMedia(null);
// // // //       if (fileRef.current) fileRef.current.value = '';
// // // //       socketRef.current?.emit('typing_stop', { receiverId: selectedUser._id, conversationId: result?.conversationId || conversationId });
// // // //       loadUsers();
// // // //     } catch (error) { toast.error(error.message); }
// // // //     finally { setSending(false); }
// // // //   }

// // // //   function onTypingChange(value) {
// // // //     setText(value);
// // // //     if (!selectedUser) return;
// // // //     socketRef.current?.emit('typing_start', { receiverId: selectedUser._id, conversationId });
// // // //     clearTimeout(typingTimer.current);
// // // //     typingTimer.current = setTimeout(() => socketRef.current?.emit('typing_stop', { receiverId: selectedUser._id, conversationId }), 900);
// // // //   }

// // // //   async function handleReaction(messageId, emoji) {
// // // //     try {
// // // //       const updated = await reactToMessage(messageId, emoji);
// // // //       setMessages((prev) => prev.map((m) => idOf(m) === idOf(updated) ? updated : m));
// // // //     } catch (error) { toast.error(error.message); }
// // // //   }

// // // //   async function handleDelete(messageId) {
// // // //     try {
// // // //       await deleteMessage(messageId);
// // // //       setMessages((prev) => prev.map((m) => idOf(m) === String(messageId) ? { ...m, deletedForEveryone: true, content: '', mediaUrl: '', reactions: [] } : m));
// // // //       loadUsers();
// // // //     } catch (error) { toast.error(error.message); }
// // // //   }

// // // //   async function handleCreateStatus(e) {
// // // //     e.preventDefault();
// // // //     if (!statusText.trim() && !statusMedia) return;
// // // //     try {
// // // //       await createStatus(statusText.trim(), statusMedia);
// // // //       setStatusText('');
// // // //       setStatusMedia(null);
// // // //       await loadStatuses();
// // // //       toast.success('Status posted');
// // // //     } catch (error) { toast.error(error.message); }
// // // //   }

// // // //   async function viewStatus(status) {
// // // //     setOpenStatus(status);
// // // //     if (idOf(status.user) !== idOf(currentUser)) await markStatusViewed(status._id);
// // // //     loadStatuses();
// // // //   }

// // // //   async function removeStatus(statusId) {
// // // //     try { await deleteStatus(statusId); setOpenStatus(null); loadStatuses(); }
// // // //     catch (error) { toast.error(error.message); }
// // // //   }

// // // //   async function saveProfile(e) {
// // // //     e.preventDefault();
// // // //     const form = new FormData();
// // // //     form.append('username', profileName.trim());
// // // //     form.append('about', profileAbout.trim());
// // // //     if (profilePhoto) form.append('profilepicture', profilePhoto);
// // // //     try {
// // // //       const result = await updateUserProfile(form);
// // // //       setCurrentUser(result.data);
// // // //       setProfileOpen(false);
// // // //       setProfilePhoto(null);
// // // //       toast.success('Profile updated');
// // // //     } catch (error) { toast.error(error.message); }
// // // //   }

// // // //   async function handleLogout() {
// // // //     try { await logoutUser(); } catch (_) {}
// // // //     disconnectSocket();
// // // //     clearUser();
// // // //     window.location.href = '/user-login';
// // // //   }

// // // //   const filteredUsers = useMemo(() => {
// // // //     const q = search.toLowerCase().trim();
// // // //     return users.filter((u) => !q || `${u.username || ''} ${u.fullPhoneNumber || ''} ${u.about || ''}`.toLowerCase().includes(q));
// // // //   }, [users, search]);

// // // //   const groupedStatuses = useMemo(() => {
// // // //     const map = new Map();
// // // //     statuses.forEach((status) => {
// // // //       const key = idOf(status.user);
// // // //       if (!map.has(key)) map.set(key, { user: status.user, items: [] });
// // // //       map.get(key).items.push(status);
// // // //     });
// // // //     return [...map.values()];
// // // //   }, [statuses]);

// // // //   return (
// // // //     <div className={`whatsapp-shell ${theme === 'dark' ? 'dark' : ''}`}>
// // // //       <aside className="icon-rail">
// // // //         <button className="profile-icon" onClick={() => setProfileOpen(true)} title="Profile"><img src={avatarOf(currentUser)} alt="Me" /></button>
// // // //         <button className={activeTab === 'chats' ? 'rail-active' : ''} onClick={() => setActiveTab('chats')} title="Chats">💬</button>
// // // //         <button className={activeTab === 'status' ? 'rail-active' : ''} onClick={() => setActiveTab('status')} title="Status">◉</button>
// // // //         <div className="rail-spacer" />
// // // //         <button onClick={toggleTheme} title="Theme">{theme === 'dark' ? '☀' : '☾'}</button>
// // // //         <button onClick={handleLogout} title="Logout">↪</button>
// // // //       </aside>

// // // //       <section className={`sidebar-panel ${selectedUser ? 'mobile-hidden' : ''}`}>
// // // //         {activeTab === 'chats' ? (
// // // //           <>
// // // //             <div className="sidebar-header"><h2>Chats</h2><button className="round-button" onClick={loadUsers}>↻</button></div>
// // // //             <div className="search-box">⌕<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search or start new chat" /></div>
// // // //             <div className="contact-list">
// // // //               {filteredUsers.length === 0 && <div className="empty-small">No other verified users yet. Log in with a second number to start chatting.</div>}
// // // //               {filteredUsers.map((u) => (
// // // //                 <button key={u._id} className={`contact-row ${idOf(selectedUser) === idOf(u) ? 'selected' : ''}`} onClick={() => selectUser(u)}>
// // // //                   <div className="avatar-wrap"><img src={avatarOf(u)} alt="" />{u.isOnline && <span className="online-dot" />}</div>
// // // //                   <div className="contact-main">
// // // //                     <div className="contact-top"><strong>{u.username || u.fullPhoneNumber || 'WhatsApp user'}</strong><span>{formatTime(u.conversation?.lastMessage?.createdAt || u.conversation?.updatedAt)}</span></div>
// // // //                     <div className="contact-bottom"><span>{messagePreview(u)}</span>{u.unreadCount > 0 && <b>{u.unreadCount}</b>}</div>
// // // //                   </div>
// // // //                 </button>
// // // //               ))}
// // // //             </div>
// // // //           </>
// // // //         ) : (
// // // //           <>
// // // //             <div className="sidebar-header"><h2>Status</h2><button className="round-button" onClick={loadStatuses}>↻</button></div>
// // // //             <form className="status-create" onSubmit={handleCreateStatus}>
// // // //               <div className="status-me"><img src={avatarOf(currentUser)} alt="Me" /><div><strong>My status</strong><small>Post text, photo or video</small></div></div>
// // // //               <textarea value={statusText} onChange={(e) => setStatusText(e.target.value)} placeholder="What's happening?" rows={3} />
// // // //               <div className="status-actions"><label className="attach-label">＋ Media<input type="file" accept="image/*,video/*" hidden onChange={(e) => setStatusMedia(e.target.files?.[0] || null)} /></label><button className="primary-mini">Post</button></div>
// // // //               {statusMedia && <small className="file-chip">{statusMedia.name}</small>}
// // // //             </form>
// // // //             <div className="status-list">
// // // //               {groupedStatuses.map((group) => (
// // // //                 <button className="status-row" key={idOf(group.user)} onClick={() => viewStatus(group.items[0])}>
// // // //                   <div className="status-ring"><img src={avatarOf(group.user)} alt="" /></div>
// // // //                   <div><strong>{idOf(group.user) === idOf(currentUser) ? 'My status' : (group.user?.username || 'User')}</strong><small>{group.items.length} update{group.items.length > 1 ? 's' : ''} · {formatTime(group.items[0].createdAt)}</small></div>
// // // //                 </button>
// // // //               ))}
// // // //               {!groupedStatuses.length && <div className="empty-small">No active status updates.</div>}
// // // //             </div>
// // // //           </>
// // // //         )}
// // // //       </section>

// // // //       <main className={`chat-panel ${selectedUser ? 'mobile-visible' : ''}`}>
// // // //         {selectedUser && activeTab === 'chats' ? (
// // // //           <>
// // // //             <header className="chat-header">
// // // //               <button className="mobile-back" onClick={() => setSelectedUser(null)}>←</button>
// // // //               <img src={avatarOf(selectedUser)} alt="" />
// // // //               <div><strong>{selectedUser.username || selectedUser.fullPhoneNumber}</strong><small>{typing ? 'typing…' : lastSeenText(selectedUser)}</small></div>
// // // //               <div className="chat-header-actions"><button title="Search">⌕</button><button title="More">⋮</button></div>
// // // //             </header>

// // // //             <div className="messages-area">
// // // //               <div className="encryption-note">🔒 Messages in this demo are delivered through your own backend and database.</div>
// // // //               {messages.map((m) => {
// // // //                 const mine = idOf(m.sender) === idOf(currentUser);
// // // //                 const reactions = m.reactions || [];
// // // //                 return (
// // // //                   <div className={`message-line ${mine ? 'mine' : 'theirs'}`} key={m._id}>
// // // //                     <div className={`message-bubble ${m.deletedForEveryone ? 'deleted' : ''}`}>
// // // //                       {m.deletedForEveryone ? (
// // // //                         <em>🚫 This message was deleted</em>
// // // //                       ) : (
// // // //                         <>
// // // //                           {m.contentType === 'image' && m.mediaUrl && <img className="message-media" src={m.mediaUrl} alt="Shared" />}
// // // //                           {m.contentType === 'video' && m.mediaUrl && <video className="message-media" src={m.mediaUrl} controls />}
// // // //                           {m.content && <div className="message-text">{m.content}</div>}
// // // //                         </>
// // // //                       )}
// // // //                       <div className="message-meta"><span>{formatTime(m.createdAt)}</span>{mine && <span className={m.messageStatus === 'read' ? 'status-read' : ''}>{m.messageStatus === 'sent' ? '✓' : '✓✓'}</span>}</div>
// // // //                       {!m.deletedForEveryone && (
// // // //                         <div className="message-tools">
// // // //                           {['👍', '❤️', '😂'].map((emoji) => <button key={emoji} onClick={() => handleReaction(m._id, emoji)}>{emoji}</button>)}
// // // //                           {mine && <button onClick={() => handleDelete(m._id)}>🗑</button>}
// // // //                         </div>
// // // //                       )}
// // // //                       {reactions.length > 0 && <div className="reaction-pill">{reactions.map((r, i) => <span key={`${idOf(r.user)}-${i}`}>{r.emoji}</span>)}</div>}
// // // //                     </div>
// // // //                   </div>
// // // //                 );
// // // //               })}
// // // //               {typing && <div className="typing-bubble"><span /><span /><span /></div>}
// // // //               <div ref={messagesEndRef} />
// // // //             </div>

// // // //             {media && <div className="media-preview-bar"><span>Attachment: {media.name}</span><button onClick={() => setMedia(null)}>×</button></div>}
// // // //             <form className="composer" onSubmit={handleSend}>
// // // //               <label className="composer-icon" title="Attach photo/video">＋<input ref={fileRef} type="file" accept="image/*,video/*" hidden onChange={(e) => setMedia(e.target.files?.[0] || null)} /></label>
// // // //               <input value={text} onChange={(e) => onTypingChange(e.target.value)} placeholder="Type a message" />
// // // //               <button className="send-button" disabled={sending || (!text.trim() && !media)}>{sending ? '…' : '➤'}</button>
// // // //             </form>
// // // //           </>
// // // //         ) : (
// // // //           <div className="welcome-pane">
// // // //             <div className="welcome-graphic">💬</div>
// // // //             <h1>WhatsApp Clone</h1>
// // // //             <p>Send and receive messages without keeping your phone connected. Choose a contact to begin.</p>
// // // //             <small>🔒 Built as a full-stack learning project.</small>
// // // //           </div>
// // // //         )}
// // // //       </main>

// // // //       {openStatus && (
// // // //         <div className="modal-backdrop" onClick={() => setOpenStatus(null)}>
// // // //           <div className="status-viewer" onClick={(e) => e.stopPropagation()}>
// // // //             <div className="status-viewer-head"><div><img src={avatarOf(openStatus.user)} alt="" /><span><strong>{openStatus.user?.username || 'Status'}</strong><small>{formatTime(openStatus.createdAt)}</small></span></div><button onClick={() => setOpenStatus(null)}>×</button></div>
// // // //             <div className="status-content">
// // // //               {openStatus.contentType === 'image' && <img src={openStatus.mediaUrl} alt="Status" />}
// // // //               {openStatus.contentType === 'video' && <video src={openStatus.mediaUrl} controls autoPlay />}
// // // //               {openStatus.content && <p>{openStatus.content}</p>}
// // // //             </div>
// // // //             {idOf(openStatus.user) === idOf(currentUser) && <div className="status-footer"><span>👁 {openStatus.viewers?.length || 0} views</span><button onClick={() => removeStatus(openStatus._id)}>Delete status</button></div>}
// // // //           </div>
// // // //         </div>
// // // //       )}

// // // //       {profileOpen && (
// // // //         <div className="modal-backdrop" onClick={() => setProfileOpen(false)}>
// // // //           <form className="profile-modal" onSubmit={saveProfile} onClick={(e) => e.stopPropagation()}>
// // // //             <div className="modal-title"><h3>Profile</h3><button type="button" onClick={() => setProfileOpen(false)}>×</button></div>
// // // //             <img className="profile-large" src={profilePhoto ? URL.createObjectURL(profilePhoto) : avatarOf(currentUser)} alt="Profile" />
// // // //             <label className="attach-label profile-photo-label">Change photo<input type="file" accept="image/*" hidden onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)} /></label>
// // // //             <label>Name<input value={profileName} onChange={(e) => setProfileName(e.target.value)} maxLength={40} /></label>
// // // //             <label>About<textarea value={profileAbout} onChange={(e) => setProfileAbout(e.target.value)} maxLength={140} rows={3} /></label>
// // // //             <button className="primary-btn">Save profile</button>
// // // //           </form>
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // }


// // // import React, { useEffect, useMemo, useRef, useState } from 'react';
// // // import { toast } from 'react-toastify';

// // // import useUserStore from '../../store/useUserStore';
// // // import useThemeStore from '../../store/useThemeStore';

// // // import {
// // //   getAllUser,
// // //   logoutUser,
// // //   updateUserProfile,
// // //   removeUserFromList,
// // // } from '../../api/authApi';

// // // import {
// // //   deleteMessage,
// // //   getMessages,
// // //   reactToMessage,
// // //   sendMessage,
// // // } from '../../api/chatApi';

// // // import {
// // //   createStatus,
// // //   deleteStatus,
// // //   getStatuses,
// // //   markStatusViewed,
// // // } from '../../api/statusApi';

// // // import {
// // //   disconnectSocket,
// // //   getSocket,
// // // } from '../../utils/socket';


// // // const fallbackAvatar = (user) =>
// // //   `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(
// // //     user?.username || user?._id || 'user'
// // //   )}`;


// // // const avatarOf = (user) =>
// // //   user?.profilepicture ||
// // //   user?.profilePicture ||
// // //   fallbackAvatar(user);


// // // const idOf = (value) =>
// // //   String(value?._id || value || '');


// // // function formatTime(value) {
// // //   if (!value) return '';

// // //   const date = new Date(value);
// // //   const now = new Date();

// // //   if (date.toDateString() === now.toDateString()) {
// // //     return date.toLocaleTimeString([], {
// // //       hour: '2-digit',
// // //       minute: '2-digit',
// // //     });
// // //   }

// // //   return date.toLocaleDateString([], {
// // //     day: '2-digit',
// // //     month: 'short',
// // //   });
// // // }


// // // function lastSeenText(user) {
// // //   if (user?.isOnline) {
// // //     return 'online';
// // //   }

// // //   if (!user?.lastSeen) {
// // //     return 'offline';
// // //   }

// // //   return `last seen ${new Date(user.lastSeen).toLocaleString([], {
// // //     dateStyle: 'short',
// // //     timeStyle: 'short',
// // //   })}`;
// // // }


// // // function messagePreview(item) {
// // //   const message =
// // //     item?.conversation?.lastMessage;

// // //   if (!message) {
// // //     return (
// // //       item?.about ||
// // //       'Start a conversation'
// // //     );
// // //   }

// // //   if (message.deletedForEveryone) {
// // //     return 'Message deleted';
// // //   }

// // //   if (message.contentType === 'image') {
// // //     return '📷 Photo';
// // //   }

// // //   if (message.contentType === 'video') {
// // //     return '🎥 Video';
// // //   }

// // //   return message.content || 'Message';
// // // }


// // // export default function Home() {

// // //   const currentUser =
// // //     useUserStore((state) => state.user);

// // //   const setCurrentUser =
// // //     useUserStore(
// // //       (state) => state.setUser
// // //     );

// // //   const clearUser =
// // //     useUserStore(
// // //       (state) => state.clearUser
// // //     );

// // //   const {
// // //     theme,
// // //     toggleTheme,
// // //   } = useThemeStore();


// // //   const [activeTab, setActiveTab] =
// // //     useState('chats');

// // //   const [users, setUsers] =
// // //     useState([]);

// // //   const [
// // //     selectedUser,
// // //     setSelectedUser,
// // //   ] = useState(null);

// // //   const selectedUserRef =
// // //     useRef(null);

// // //   const [
// // //     conversationId,
// // //     setConversationId,
// // //   ] = useState(null);

// // //   const [messages, setMessages] =
// // //     useState([]);

// // //   const [search, setSearch] =
// // //     useState('');

// // //   const [text, setText] =
// // //     useState('');

// // //   const [media, setMedia] =
// // //     useState(null);

// // //   const [sending, setSending] =
// // //     useState(false);

// // //   const [typing, setTyping] =
// // //     useState(false);

// // //   const [statuses, setStatuses] =
// // //     useState([]);

// // //   const [statusText, setStatusText] =
// // //     useState('');

// // //   const [
// // //     statusMedia,
// // //     setStatusMedia,
// // //   ] = useState(null);

// // //   const [
// // //     openStatus,
// // //     setOpenStatus,
// // //   ] = useState(null);

// // //   const [
// // //     profileOpen,
// // //     setProfileOpen,
// // //   ] = useState(false);

// // //   const [
// // //     profileName,
// // //     setProfileName,
// // //   ] = useState(
// // //     currentUser?.username || ''
// // //   );

// // //   const [
// // //     profileAbout,
// // //     setProfileAbout,
// // //   ] = useState(
// // //     currentUser?.about || ''
// // //   );

// // //   const [
// // //     profilePhoto,
// // //     setProfilePhoto,
// // //   ] = useState(null);


// // //   const messagesEndRef =
// // //     useRef(null);

// // //   const fileRef =
// // //     useRef(null);

// // //   const typingTimer =
// // //     useRef(null);

// // //   const socketRef =
// // //     useRef(null);


// // //   useEffect(() => {
// // //     selectedUserRef.current =
// // //       selectedUser;
// // //   }, [selectedUser]);


// // //   // =========================
// // //   // LOAD USERS
// // //   // =========================

// // //   const loadUsers = async () => {
// // //     try {

// // //       const result =
// // //         await getAllUser();

// // //       const list =
// // //         result?.data || [];

// // //       setUsers(list);


// // //       const selectedId =
// // //         idOf(
// // //           selectedUserRef.current
// // //         );


// // //       if (selectedId) {

// // //         const fresh =
// // //           list.find(
// // //             (user) =>
// // //               idOf(user) ===
// // //               selectedId
// // //           );


// // //         if (fresh) {

// // //           setSelectedUser(
// // //             fresh
// // //           );

// // //           selectedUserRef.current =
// // //             fresh;
// // //         }
// // //       }

// // //     } catch (error) {

// // //       toast.error(
// // //         error.message
// // //       );
// // //     }
// // //   };


// // //   // =========================
// // //   // LOAD STATUS
// // //   // =========================

// // //   const loadStatuses = async () => {

// // //     try {

// // //       setStatuses(
// // //         await getStatuses()
// // //       );

// // //     } catch (error) {

// // //       toast.error(
// // //         error.message
// // //       );
// // //     }
// // //   };


// // //   useEffect(() => {

// // //     loadUsers();

// // //     loadStatuses();


// // //     const userInterval =
// // //       setInterval(
// // //         loadUsers,
// // //         15000
// // //       );


// // //     return () =>
// // //       clearInterval(
// // //         userInterval
// // //       );

// // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // //   }, []);


// // //   // =========================
// // //   // SOCKET
// // //   // =========================

// // //   useEffect(() => {

// // //     if (!currentUser?._id) {
// // //       return;
// // //     }


// // //     let mounted = true;

// // //     let socket;


// // //     getSocket()
// // //       .then(
// // //         (socketInstance) => {

// // //           if (!mounted) {
// // //             return;
// // //           }


// // //           socket =
// // //             socketInstance;

// // //           socketRef.current =
// // //             socketInstance;


// // //           socketInstance.emit(
// // //             'user_connected',
// // //             currentUser._id
// // //           );


// // //           const onReceive = (
// // //             message
// // //           ) => {

// // //             const peer =
// // //               selectedUserRef.current;

// // //             const peerId =
// // //               idOf(peer);

// // //             const senderId =
// // //               idOf(
// // //                 message.sender
// // //               );


// // //             if (
// // //               peerId &&
// // //               senderId ===
// // //                 peerId
// // //             ) {

// // //               setMessages(
// // //                 (
// // //                   previousMessages
// // //                 ) =>
// // //                   previousMessages.some(
// // //                     (item) =>
// // //                       idOf(
// // //                         item
// // //                       ) ===
// // //                       idOf(
// // //                         message
// // //                       )
// // //                   )
// // //                     ? previousMessages
// // //                     : [
// // //                         ...previousMessages,
// // //                         message,
// // //                       ]
// // //               );
// // //             }


// // //             loadUsers();
// // //           };


// // //           const onUpdated =
// // //             () =>
// // //               loadUsers();


// // //           const onUserStatus = ({
// // //             userId,
// // //             isOnline,
// // //             lastSeen,
// // //           }) => {

// // //             setUsers(
// // //               (
// // //                 previousUsers
// // //               ) =>
// // //                 previousUsers.map(
// // //                   (user) =>
// // //                     idOf(user) ===
// // //                     String(
// // //                       userId
// // //                     )
// // //                       ? {
// // //                           ...user,
// // //                           isOnline,
// // //                           lastSeen,
// // //                         }
// // //                       : user
// // //                 )
// // //             );


// // //             setSelectedUser(
// // //               (
// // //                 previousUser
// // //               ) =>
// // //                 previousUser &&
// // //                 idOf(
// // //                   previousUser
// // //                 ) ===
// // //                   String(
// // //                     userId
// // //                   )
// // //                   ? {
// // //                       ...previousUser,
// // //                       isOnline,
// // //                       lastSeen,
// // //                     }
// // //                   : previousUser
// // //             );
// // //           };


// // //           const onTyping = ({
// // //             userId,
// // //             isTyping,
// // //           }) => {

// // //             if (
// // //               idOf(
// // //                 selectedUserRef.current
// // //               ) ===
// // //               String(userId)
// // //             ) {

// // //               setTyping(
// // //                 Boolean(
// // //                   isTyping
// // //                 )
// // //               );
// // //             }
// // //           };


// // //           const onReaction = (
// // //             updated
// // //           ) => {

// // //             setMessages(
// // //               (
// // //                 previousMessages
// // //               ) =>
// // //                 previousMessages.map(
// // //                   (message) =>
// // //                     idOf(
// // //                       message
// // //                     ) ===
// // //                     idOf(
// // //                       updated
// // //                     )
// // //                       ? updated
// // //                       : message
// // //                 )
// // //             );
// // //           };


// // //           const onDeleted = ({
// // //             messageId,
// // //           }) => {

// // //             setMessages(
// // //               (
// // //                 previousMessages
// // //               ) =>
// // //                 previousMessages.map(
// // //                   (message) =>
// // //                     idOf(
// // //                       message
// // //                     ) ===
// // //                     String(
// // //                       messageId
// // //                     )
// // //                       ? {
// // //                           ...message,
// // //                           deletedForEveryone:
// // //                             true,
// // //                           content: '',
// // //                           mediaUrl: '',
// // //                           reactions: [],
// // //                         }
// // //                       : message
// // //                 )
// // //             );
// // //           };


// // //           const onStatus =
// // //             () =>
// // //               loadStatuses();


// // //           const onStatusUpdate = ({
// // //             messageIds,
// // //             messageStatus,
// // //           }) => {

// // //             const ids =
// // //               new Set(
// // //                 (
// // //                   messageIds ||
// // //                   []
// // //                 ).map(
// // //                   String
// // //                 )
// // //               );


// // //             setMessages(
// // //               (
// // //                 previousMessages
// // //               ) =>
// // //                 previousMessages.map(
// // //                   (message) =>
// // //                     ids.has(
// // //                       idOf(
// // //                         message
// // //                       )
// // //                     )
// // //                       ? {
// // //                           ...message,
// // //                           messageStatus,
// // //                         }
// // //                       : message
// // //                 )
// // //             );
// // //           };


// // //           socketInstance.on(
// // //             'receive_message',
// // //             onReceive
// // //           );

// // //           socketInstance.on(
// // //             'conversation_updated',
// // //             onUpdated
// // //           );

// // //           socketInstance.on(
// // //             'user_status',
// // //             onUserStatus
// // //           );

// // //           socketInstance.on(
// // //             'user_typing',
// // //             onTyping
// // //           );

// // //           socketInstance.on(
// // //             'reaction_update',
// // //             onReaction
// // //           );

// // //           socketInstance.on(
// // //             'message_deleted',
// // //             onDeleted
// // //           );

// // //           socketInstance.on(
// // //             'status_updated',
// // //             onStatus
// // //           );

// // //           socketInstance.on(
// // //             'message_status_update',
// // //             onStatusUpdate
// // //           );


// // //           socketInstance
// // //             .__cleanupWhatsapp =
// // //             () => {

// // //               socketInstance.off(
// // //                 'receive_message',
// // //                 onReceive
// // //               );

// // //               socketInstance.off(
// // //                 'conversation_updated',
// // //                 onUpdated
// // //               );

// // //               socketInstance.off(
// // //                 'user_status',
// // //                 onUserStatus
// // //               );

// // //               socketInstance.off(
// // //                 'user_typing',
// // //                 onTyping
// // //               );

// // //               socketInstance.off(
// // //                 'reaction_update',
// // //                 onReaction
// // //               );

// // //               socketInstance.off(
// // //                 'message_deleted',
// // //                 onDeleted
// // //               );

// // //               socketInstance.off(
// // //                 'status_updated',
// // //                 onStatus
// // //               );

// // //               socketInstance.off(
// // //                 'message_status_update',
// // //                 onStatusUpdate
// // //               );
// // //             };
// // //         }
// // //       )

// // //       .catch(() => {

// // //         // REST polling still works
// // //         // if socket connection fails.

// // //       });


// // //     return () => {

// // //       mounted = false;


// // //       if (
// // //         socket
// // //           ?.__cleanupWhatsapp
// // //       ) {

// // //         socket
// // //           .__cleanupWhatsapp();
// // //       }
// // //     };

// // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // //   }, [currentUser?._id]);


// // //   // =========================
// // //   // AUTO SCROLL
// // //   // =========================

// // //   useEffect(() => {

// // //     messagesEndRef.current
// // //       ?.scrollIntoView({
// // //         behavior:
// // //           'smooth',

// // //         block:
// // //           'nearest',

// // //         inline:
// // //           'nearest',
// // //       });

// // //   }, [messages, typing]);


// // //   // =========================
// // //   // SELECT USER
// // //   // =========================

// // //   async function selectUser(
// // //     user
// // //   ) {

// // //     setSelectedUser(
// // //       user
// // //     );

// // //     selectedUserRef.current =
// // //       user;

// // //     setTyping(
// // //       false
// // //     );


// // //     const cid =
// // //       user
// // //         ?.conversation
// // //         ?._id ||
// // //       null;


// // //     setConversationId(
// // //       cid
// // //     );

// // //     setMessages([]);


// // //     if (cid) {

// // //       try {

// // //         const data =
// // //           await getMessages(
// // //             cid
// // //           );


// // //         setMessages(
// // //           data
// // //         );


// // //         loadUsers();

// // //       } catch (error) {

// // //         toast.error(
// // //           error.message
// // //         );
// // //       }
// // //     }
// // //   }


// // //   // =========================
// // //   // REMOVE / HIDE USER
// // //   // =========================

// // //   async function handleRemoveUser(
// // //     user,
// // //     event
// // //   ) {

// // //     event?.stopPropagation();


// // //     const userName =
// // //       user?.username ||
// // //       user?.fullPhoneNumber ||
// // //       'this user';


// // //     const confirmed =
// // //       window.confirm(
// // //         `Remove ${userName} from your chat list?`
// // //       );


// // //     if (!confirmed) {
// // //       return;
// // //     }


// // //     try {

// // //       await removeUserFromList(
// // //         user._id
// // //       );


// // //       setUsers(
// // //         (
// // //           previousUsers
// // //         ) =>
// // //           previousUsers.filter(
// // //             (item) =>
// // //               idOf(
// // //                 item
// // //               ) !==
// // //               idOf(
// // //                 user
// // //               )
// // //           )
// // //       );


// // //       if (
// // //         idOf(
// // //           selectedUserRef.current
// // //         ) ===
// // //         idOf(
// // //           user
// // //         )
// // //       ) {

// // //         setSelectedUser(
// // //           null
// // //         );

// // //         selectedUserRef.current =
// // //           null;

// // //         setConversationId(
// // //           null
// // //         );

// // //         setMessages([]);

// // //         setTyping(
// // //           false
// // //         );
// // //       }


// // //       toast.success(
// // //         'User removed from chat list'
// // //       );

// // //     } catch (error) {

// // //       toast.error(
// // //         error.message ||
// // //           'Unable to remove user'
// // //       );
// // //     }
// // //   }


// // //   // =========================
// // //   // SEND MESSAGE
// // //   // =========================

// // //   async function handleSend(
// // //     event
// // //   ) {

// // //     event
// // //       ?.preventDefault();


// // //     if (
// // //       !selectedUser ||
// // //       (
// // //         !text.trim() &&
// // //         !media
// // //       ) ||
// // //       sending
// // //     ) {
// // //       return;
// // //     }


// // //     setSending(
// // //       true
// // //     );


// // //     try {

// // //       const result =
// // //         await sendMessage(
// // //           selectedUser._id,
// // //           text.trim(),
// // //           media
// // //         );


// // //       if (
// // //         result?.message
// // //       ) {

// // //         setMessages(
// // //           (
// // //             previousMessages
// // //           ) =>
// // //             previousMessages.some(
// // //               (message) =>
// // //                 idOf(
// // //                   message
// // //                 ) ===
// // //                 idOf(
// // //                   result.message
// // //                 )
// // //             )
// // //               ? previousMessages
// // //               : [
// // //                   ...previousMessages,
// // //                   result.message,
// // //                 ]
// // //         );
// // //       }


// // //       if (
// // //         result
// // //           ?.conversationId
// // //       ) {

// // //         setConversationId(
// // //           String(
// // //             result
// // //               .conversationId
// // //           )
// // //         );
// // //       }


// // //       setText('');

// // //       setMedia(
// // //         null
// // //       );


// // //       if (
// // //         fileRef.current
// // //       ) {

// // //         fileRef.current.value =
// // //           '';
// // //       }


// // //       socketRef.current
// // //         ?.emit(
// // //           'typing_stop',
// // //           {

// // //             receiverId:
// // //               selectedUser._id,

// // //             conversationId:
// // //               result
// // //                 ?.conversationId ||
// // //               conversationId,
// // //           }
// // //         );


// // //       loadUsers();

// // //     } catch (error) {

// // //       toast.error(
// // //         error.message
// // //       );

// // //     } finally {

// // //       setSending(
// // //         false
// // //       );
// // //     }
// // //   }


// // //   // =========================
// // //   // TYPING
// // //   // =========================

// // //   function onTypingChange(
// // //     value
// // //   ) {

// // //     setText(
// // //       value
// // //     );


// // //     if (!selectedUser) {
// // //       return;
// // //     }


// // //     socketRef.current
// // //       ?.emit(
// // //         'typing_start',
// // //         {
// // //           receiverId:
// // //             selectedUser._id,

// // //           conversationId,
// // //         }
// // //       );


// // //     clearTimeout(
// // //       typingTimer.current
// // //     );


// // //     typingTimer.current =
// // //       setTimeout(
// // //         () => {

// // //           socketRef.current
// // //             ?.emit(
// // //               'typing_stop',
// // //               {

// // //                 receiverId:
// // //                   selectedUser._id,

// // //                 conversationId,
// // //               }
// // //             );

// // //         },
// // //         900
// // //       );
// // //   }


// // //   // =========================
// // //   // REACTION
// // //   // =========================

// // //   async function handleReaction(
// // //     messageId,
// // //     emoji
// // //   ) {

// // //     try {

// // //       const updated =
// // //         await reactToMessage(
// // //           messageId,
// // //           emoji
// // //         );


// // //       setMessages(
// // //         (
// // //           previousMessages
// // //         ) =>
// // //           previousMessages.map(
// // //             (message) =>
// // //               idOf(
// // //                 message
// // //               ) ===
// // //               idOf(
// // //                 updated
// // //               )
// // //                 ? updated
// // //                 : message
// // //           )
// // //       );

// // //     } catch (error) {

// // //       toast.error(
// // //         error.message
// // //       );
// // //     }
// // //   }


// // //   // =========================
// // //   // DELETE MESSAGE
// // //   // =========================

// // //   async function handleDelete(
// // //     messageId
// // //   ) {

// // //     try {

// // //       await deleteMessage(
// // //         messageId
// // //       );


// // //       setMessages(
// // //         (
// // //           previousMessages
// // //         ) =>
// // //           previousMessages.map(
// // //             (message) =>
// // //               idOf(
// // //                 message
// // //               ) ===
// // //               String(
// // //                 messageId
// // //               )
// // //                 ? {
// // //                     ...message,

// // //                     deletedForEveryone:
// // //                       true,

// // //                     content: '',

// // //                     mediaUrl: '',

// // //                     reactions: [],
// // //                   }
// // //                 : message
// // //           )
// // //       );


// // //       loadUsers();

// // //     } catch (error) {

// // //       toast.error(
// // //         error.message
// // //       );
// // //     }
// // //   }


// // //   // =========================
// // //   // CREATE STATUS
// // //   // =========================

// // //   async function handleCreateStatus(
// // //     event
// // //   ) {

// // //     event
// // //       .preventDefault();


// // //     if (
// // //       !statusText.trim() &&
// // //       !statusMedia
// // //     ) {
// // //       return;
// // //     }


// // //     try {

// // //       await createStatus(
// // //         statusText.trim(),
// // //         statusMedia
// // //       );


// // //       setStatusText('');

// // //       setStatusMedia(
// // //         null
// // //       );


// // //       await loadStatuses();


// // //       toast.success(
// // //         'Status posted'
// // //       );

// // //     } catch (error) {

// // //       toast.error(
// // //         error.message
// // //       );
// // //     }
// // //   }


// // //   // =========================
// // //   // VIEW STATUS
// // //   // =========================

// // //   async function viewStatus(
// // //     status
// // //   ) {

// // //     setOpenStatus(
// // //       status
// // //     );


// // //     if (
// // //       idOf(
// // //         status.user
// // //       ) !==
// // //       idOf(
// // //         currentUser
// // //       )
// // //     ) {

// // //       await markStatusViewed(
// // //         status._id
// // //       );
// // //     }


// // //     loadStatuses();
// // //   }


// // //   // =========================
// // //   // DELETE STATUS
// // //   // =========================

// // //   async function removeStatus(
// // //     statusId
// // //   ) {

// // //     try {

// // //       await deleteStatus(
// // //         statusId
// // //       );


// // //       setOpenStatus(
// // //         null
// // //       );


// // //       loadStatuses();

// // //     } catch (error) {

// // //       toast.error(
// // //         error.message
// // //       );
// // //     }
// // //   }


// // //   // =========================
// // //   // SAVE PROFILE
// // //   // =========================

// // //   async function saveProfile(
// // //     event
// // //   ) {

// // //     event
// // //       .preventDefault();


// // //     const form =
// // //       new FormData();


// // //     form.append(
// // //       'username',
// // //       profileName.trim()
// // //     );


// // //     form.append(
// // //       'about',
// // //       profileAbout.trim()
// // //     );


// // //     if (
// // //       profilePhoto
// // //     ) {

// // //       form.append(
// // //         'profilepicture',
// // //         profilePhoto
// // //       );
// // //     }


// // //     try {

// // //       const result =
// // //         await updateUserProfile(
// // //           form
// // //         );


// // //       setCurrentUser(
// // //         result.data
// // //       );


// // //       setProfileOpen(
// // //         false
// // //       );


// // //       setProfilePhoto(
// // //         null
// // //       );


// // //       toast.success(
// // //         'Profile updated'
// // //       );

// // //     } catch (error) {

// // //       toast.error(
// // //         error.message
// // //       );
// // //     }
// // //   }


// // //   // =========================
// // //   // LOGOUT
// // //   // =========================

// // //   async function handleLogout() {

// // //     try {

// // //       await logoutUser();

// // //     } catch (_) {}


// // //     disconnectSocket();


// // //     clearUser();


// // //     window.location.href =
// // //       '/user-login';
// // //   }


// // //   // =========================
// // //   // FILTER USERS
// // //   // =========================

// // //   const filteredUsers =
// // //     useMemo(
// // //       () => {

// // //         const query =
// // //           search
// // //             .toLowerCase()
// // //             .trim();


// // //         return users.filter(
// // //           (user) => {

// // //             if (!query) {
// // //               return true;
// // //             }


// // //             const value =
// // //               `${
// // //                 user.username ||
// // //                 ''
// // //               } ${
// // //                 user.fullPhoneNumber ||
// // //                 ''
// // //               } ${
// // //                 user.about ||
// // //                 ''
// // //               }`
// // //                 .toLowerCase();


// // //             return value.includes(
// // //               query
// // //             );
// // //           }
// // //         );

// // //       },
// // //       [
// // //         users,
// // //         search,
// // //       ]
// // //     );


// // //   // =========================
// // //   // GROUP STATUS
// // //   // =========================

// // //   const groupedStatuses =
// // //     useMemo(
// // //       () => {

// // //         const map =
// // //           new Map();


// // //         statuses.forEach(
// // //           (status) => {

// // //             const key =
// // //               idOf(
// // //                 status.user
// // //               );


// // //             if (
// // //               !map.has(
// // //                 key
// // //               )
// // //             ) {

// // //               map.set(
// // //                 key,
// // //                 {

// // //                   user:
// // //                     status.user,

// // //                   items:
// // //                     [],
// // //                 }
// // //               );
// // //             }


// // //             map
// // //               .get(
// // //                 key
// // //               )
// // //               .items
// // //               .push(
// // //                 status
// // //               );
// // //           }
// // //         );


// // //         return [
// // //           ...map.values(),
// // //         ];

// // //       },
// // //       [
// // //         statuses,
// // //       ]
// // //     );


// // //   return (

// // //     <div
// // //       className={`whatsapp-shell ${
// // //         theme ===
// // //         'dark'
// // //           ? 'dark'
// // //           : ''
// // //       }`}
// // //     >


// // //       {/* LEFT SIDEBAR ICONS */}

// // //       <aside
// // //         className="icon-rail"
// // //       >

// // //         <button
// // //           className="profile-icon"
// // //           onClick={() =>
// // //             setProfileOpen(
// // //               true
// // //             )
// // //           }
// // //           title="Profile"
// // //         >

// // //           <img
// // //             src={avatarOf(
// // //               currentUser
// // //             )}
// // //             alt="Me"
// // //           />

// // //         </button>


// // //         <button
// // //           className={
// // //             activeTab ===
// // //             'chats'
// // //               ? 'rail-active'
// // //               : ''
// // //           }
// // //           onClick={() =>
// // //             setActiveTab(
// // //               'chats'
// // //             )
// // //           }
// // //           title="Chats"
// // //         >
// // //           💬
// // //         </button>


// // //         <button
// // //           className={
// // //             activeTab ===
// // //             'status'
// // //               ? 'rail-active'
// // //               : ''
// // //           }
// // //           onClick={() =>
// // //             setActiveTab(
// // //               'status'
// // //             )
// // //           }
// // //           title="Status"
// // //         >
// // //           ◉
// // //         </button>


// // //         <div
// // //           className="rail-spacer"
// // //         />


// // //         <button
// // //           onClick={
// // //             toggleTheme
// // //           }
// // //           title="Theme"
// // //         >

// // //           {theme ===
// // //           'dark'
// // //             ? '☀'
// // //             : '☾'}

// // //         </button>


// // //         <button
// // //           onClick={
// // //             handleLogout
// // //           }
// // //           title="Logout"
// // //         >
// // //           ↪
// // //         </button>

// // //       </aside>


// // //       {/* CHAT SIDEBAR */}

// // //       <section
// // //         className={`sidebar-panel ${
// // //           selectedUser
// // //             ? 'mobile-hidden'
// // //             : ''
// // //         }`}
// // //       >

// // //         {activeTab ===
// // //         'chats' ? (

// // //           <>

// // //             <div
// // //               className="sidebar-header"
// // //             >

// // //               <h2>
// // //                 Chats
// // //               </h2>


// // //               <button
// // //                 className="round-button"
// // //                 onClick={
// // //                   loadUsers
// // //                 }
// // //               >
// // //                 ↻
// // //               </button>

// // //             </div>


// // //             <div
// // //               className="search-box"
// // //             >

// // //               ⌕


// // //               <input
// // //                 value={
// // //                   search
// // //                 }
// // //                 onChange={(
// // //                   event
// // //                 ) =>
// // //                   setSearch(
// // //                     event
// // //                       .target
// // //                       .value
// // //                   )
// // //                 }
// // //                 placeholder="Search or start new chat"
// // //               />

// // //             </div>


// // //             <div
// // //               className="contact-list"
// // //             >

// // //               {filteredUsers
// // //                 .length ===
// // //                 0 && (

// // //                 <div
// // //                   className="empty-small"
// // //                 >
// // //                   No other verified users yet.
// // //                 </div>
// // //               )}


// // //               {filteredUsers.map(
// // //                 (user) => (

// // //                   <div
// // //                     className="contact-row-wrapper"
// // //                     key={
// // //                       user._id
// // //                     }
// // //                   >


// // //                     <button
// // //                       type="button"
// // //                       className={`contact-row ${
// // //                         idOf(
// // //                           selectedUser
// // //                         ) ===
// // //                         idOf(
// // //                           user
// // //                         )
// // //                           ? 'selected'
// // //                           : ''
// // //                       }`}
// // //                       onClick={() =>
// // //                         selectUser(
// // //                           user
// // //                         )
// // //                       }
// // //                     >


// // //                       <div
// // //                         className="avatar-wrap"
// // //                       >

// // //                         <img
// // //                           src={avatarOf(
// // //                             user
// // //                           )}
// // //                           alt=""
// // //                         />


// // //                         {user.isOnline && (

// // //                           <span
// // //                             className="online-dot"
// // //                           />

// // //                         )}

// // //                       </div>


// // //                       <div
// // //                         className="contact-main"
// // //                       >


// // //                         <div
// // //                           className="contact-top"
// // //                         >

// // //                           <strong>

// // //                             {user.username ||
// // //                               user.fullPhoneNumber ||
// // //                               'WhatsApp user'}

// // //                           </strong>


// // //                           <span>

// // //                             {formatTime(
// // //                               user
// // //                                 .conversation
// // //                                 ?.lastMessage
// // //                                 ?.createdAt ||
// // //                               user
// // //                                 .conversation
// // //                                 ?.updatedAt
// // //                             )}

// // //                           </span>

// // //                         </div>


// // //                         <div
// // //                           className="contact-bottom"
// // //                         >

// // //                           <span>

// // //                             {messagePreview(
// // //                               user
// // //                             )}

// // //                           </span>


// // //                           {user.unreadCount >
// // //                             0 && (

// // //                             <b>
// // //                               {
// // //                                 user.unreadCount
// // //                               }
// // //                             </b>

// // //                           )}

// // //                         </div>

// // //                       </div>

// // //                     </button>


// // //                     {/* PREMIUM REMOVE BUTTON */}

// // //                     <button
// // //                       type="button"
// // //                       className="contact-delete-button"
// // //                       title="Remove from chat list"
// // //                       aria-label="Remove from chat list"
// // //                       onClick={(
// // //                         event
// // //                       ) =>
// // //                         handleRemoveUser(
// // //                           user,
// // //                           event
// // //                         )
// // //                       }
// // //                     >

// // //                       <svg
// // //                         viewBox="0 0 24 24"
// // //                         aria-hidden="true"
// // //                       >

// // //                         <path
// // //                           d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-2 6h10l-.7 11H7.7L7 9Zm3 2v7h2v-7h-2Zm4 0v7h2v-7h-2Z"
// // //                           fill="currentColor"
// // //                         />

// // //                       </svg>

// // //                     </button>

// // //                   </div>

// // //                 )
// // //               )}

// // //             </div>

// // //           </>

// // //         ) : (

// // //           <>

// // //             <div
// // //               className="sidebar-header"
// // //             >

// // //               <h2>
// // //                 Status
// // //               </h2>


// // //               <button
// // //                 className="round-button"
// // //                 onClick={
// // //                   loadStatuses
// // //                 }
// // //               >
// // //                 ↻
// // //               </button>

// // //             </div>


// // //             <form
// // //               className="status-create"
// // //               onSubmit={
// // //                 handleCreateStatus
// // //               }
// // //             >

// // //               <div
// // //                 className="status-me"
// // //               >

// // //                 <img
// // //                   src={avatarOf(
// // //                     currentUser
// // //                   )}
// // //                   alt="Me"
// // //                 />


// // //                 <div>

// // //                   <strong>
// // //                     My status
// // //                   </strong>


// // //                   <small>
// // //                     Post text, photo or video
// // //                   </small>

// // //                 </div>

// // //               </div>


// // //               <textarea
// // //                 value={
// // //                   statusText
// // //                 }
// // //                 onChange={(
// // //                   event
// // //                 ) =>
// // //                   setStatusText(
// // //                     event
// // //                       .target
// // //                       .value
// // //                   )
// // //                 }
// // //                 placeholder="What's happening?"
// // //                 rows={3}
// // //               />


// // //               <div
// // //                 className="status-actions"
// // //               >

// // //                 <label
// // //                   className="attach-label"
// // //                 >

// // //                   ＋ Media


// // //                   <input
// // //                     type="file"
// // //                     accept="image/*,video/*"
// // //                     hidden
// // //                     onChange={(
// // //                       event
// // //                     ) =>
// // //                       setStatusMedia(
// // //                         event
// // //                           .target
// // //                           .files?.[0] ||
// // //                           null
// // //                       )
// // //                     }
// // //                   />

// // //                 </label>


// // //                 <button
// // //                   className="primary-mini"
// // //                 >
// // //                   Post
// // //                 </button>

// // //               </div>


// // //               {statusMedia && (

// // //                 <small
// // //                   className="file-chip"
// // //                 >
// // //                   {
// // //                     statusMedia.name
// // //                   }
// // //                 </small>

// // //               )}

// // //             </form>


// // //             <div
// // //               className="status-list"
// // //             >

// // //               {groupedStatuses.map(
// // //                 (group) => (

// // //                   <button
// // //                     className="status-row"
// // //                     key={idOf(
// // //                       group.user
// // //                     )}
// // //                     onClick={() =>
// // //                       viewStatus(
// // //                         group
// // //                           .items[0]
// // //                       )
// // //                     }
// // //                   >

// // //                     <div
// // //                       className="status-ring"
// // //                     >

// // //                       <img
// // //                         src={avatarOf(
// // //                           group.user
// // //                         )}
// // //                         alt=""
// // //                       />

// // //                     </div>


// // //                     <div>

// // //                       <strong>

// // //                         {idOf(
// // //                           group.user
// // //                         ) ===
// // //                         idOf(
// // //                           currentUser
// // //                         )
// // //                           ? 'My status'
// // //                           : group
// // //                               .user
// // //                               ?.username ||
// // //                             'User'}

// // //                       </strong>


// // //                       <small>

// // //                         {
// // //                           group
// // //                             .items
// // //                             .length
// // //                         }{' '}

// // //                         update

// // //                         {group
// // //                           .items
// // //                           .length >
// // //                         1
// // //                           ? 's'
// // //                           : ''}

// // //                         {' '}·{' '}

// // //                         {formatTime(
// // //                           group
// // //                             .items[0]
// // //                             .createdAt
// // //                         )}

// // //                       </small>

// // //                     </div>

// // //                   </button>

// // //                 )
// // //               )}


// // //               {!groupedStatuses
// // //                 .length && (

// // //                 <div
// // //                   className="empty-small"
// // //                 >
// // //                   No active status updates.
// // //                 </div>

// // //               )}

// // //             </div>

// // //           </>

// // //         )}

// // //       </section>


// // //       {/* CHAT */}

// // //       <main
// // //         className={`chat-panel ${
// // //           selectedUser
// // //             ? 'mobile-visible'
// // //             : ''
// // //         }`}
// // //       >

// // //         {selectedUser &&
// // //         activeTab ===
// // //           'chats' ? (

// // //           <>

// // //             <header
// // //               className="chat-header"
// // //             >

// // //               <button
// // //                 className="mobile-back"
// // //                 onClick={() =>
// // //                   setSelectedUser(
// // //                     null
// // //                   )
// // //                 }
// // //               >
// // //                 ←
// // //               </button>


// // //               <img
// // //                 src={avatarOf(
// // //                   selectedUser
// // //                 )}
// // //                 alt=""
// // //               />


// // //               <div>

// // //                 <strong>

// // //                   {selectedUser.username ||
// // //                     selectedUser.fullPhoneNumber}

// // //                 </strong>


// // //                 <small>

// // //                   {typing
// // //                     ? 'typing…'
// // //                     : lastSeenText(
// // //                         selectedUser
// // //                       )}

// // //                 </small>

// // //               </div>


// // //               <div
// // //                 className="chat-header-actions"
// // //               >

// // //                 <button
// // //                   title="Search"
// // //                 >
// // //                   ⌕
// // //                 </button>


// // //                 <button
// // //                   title="More"
// // //                 >
// // //                   ⋮
// // //                 </button>

// // //               </div>

// // //             </header>


// // //             <div
// // //               className="messages-area"
// // //             >

// // //               <div
// // //                 className="encryption-note"
// // //               >
// // //                 🔒 Messages in this demo are delivered through your own backend and database.
// // //               </div>


// // //               {messages.map(
// // //                 (message) => {

// // //                   const mine =
// // //                     idOf(
// // //                       message.sender
// // //                     ) ===
// // //                     idOf(
// // //                       currentUser
// // //                     );


// // //                   const reactions =
// // //                     message.reactions ||
// // //                     [];


// // //                   return (

// // //                     <div
// // //                       className={`message-line ${
// // //                         mine
// // //                           ? 'mine'
// // //                           : 'theirs'
// // //                       }`}
// // //                       key={
// // //                         message._id
// // //                       }
// // //                     >

// // //                       <div
// // //                         className={`message-bubble ${
// // //                           message.deletedForEveryone
// // //                             ? 'deleted'
// // //                             : ''
// // //                         }`}
// // //                       >


// // //                         {message.deletedForEveryone ? (

// // //                           <em>
// // //                             🚫 This message was deleted
// // //                           </em>

// // //                         ) : (

// // //                           <>

// // //                             {message.contentType ===
// // //                               'image' &&
// // //                               message.mediaUrl && (

// // //                                 <img
// // //                                   className="message-media"
// // //                                   src={
// // //                                     message.mediaUrl
// // //                                   }
// // //                                   alt="Shared"
// // //                                 />

// // //                               )}


// // //                             {message.contentType ===
// // //                               'video' &&
// // //                               message.mediaUrl && (

// // //                                 <video
// // //                                   className="message-media"
// // //                                   src={
// // //                                     message.mediaUrl
// // //                                   }
// // //                                   controls
// // //                                 />

// // //                               )}


// // //                             {message.content && (

// // //                               <div
// // //                                 className="message-text"
// // //                               >
// // //                                 {
// // //                                   message.content
// // //                                 }
// // //                               </div>

// // //                             )}

// // //                           </>

// // //                         )}


// // //                         <div
// // //                           className="message-meta"
// // //                         >

// // //                           <span>

// // //                             {formatTime(
// // //                               message.createdAt
// // //                             )}

// // //                           </span>


// // //                           {mine && (

// // //                             <span
// // //                               className={
// // //                                 message.messageStatus ===
// // //                                 'read'
// // //                                   ? 'status-read'
// // //                                   : ''
// // //                               }
// // //                             >

// // //                               {message.messageStatus ===
// // //                               'sent'
// // //                                 ? '✓'
// // //                                 : '✓✓'}

// // //                             </span>

// // //                           )}

// // //                         </div>


// // //                         {!message.deletedForEveryone && (

// // //                           <div
// // //                             className="message-tools"
// // //                           >

// // //                             {[
// // //                               '👍',
// // //                               '❤️',
// // //                               '😂',
// // //                             ].map(
// // //                               (
// // //                                 emoji
// // //                               ) => (

// // //                                 <button
// // //                                   key={
// // //                                     emoji
// // //                                   }
// // //                                   onClick={() =>
// // //                                     handleReaction(
// // //                                       message._id,
// // //                                       emoji
// // //                                     )
// // //                                   }
// // //                                 >
// // //                                   {
// // //                                     emoji
// // //                                   }
// // //                                 </button>

// // //                               )
// // //                             )}


// // //                             {mine && (

// // //                               <button
// // //                                 onClick={() =>
// // //                                   handleDelete(
// // //                                     message._id
// // //                                   )
// // //                                 }
// // //                               >
// // //                                 🗑
// // //                               </button>

// // //                             )}

// // //                           </div>

// // //                         )}


// // //                         {reactions.length >
// // //                           0 && (

// // //                           <div
// // //                             className="reaction-pill"
// // //                           >

// // //                             {reactions.map(
// // //                               (
// // //                                 reaction,
// // //                                 index
// // //                               ) => (

// // //                                 <span
// // //                                   key={`${idOf(
// // //                                     reaction.user
// // //                                   )}-${index}`}
// // //                                 >
// // //                                   {
// // //                                     reaction.emoji
// // //                                   }
// // //                                 </span>

// // //                               )
// // //                             )}

// // //                           </div>

// // //                         )}

// // //                       </div>

// // //                     </div>

// // //                   );
// // //                 }
// // //               )}


// // //               {typing && (

// // //                 <div
// // //                   className="typing-bubble"
// // //                 >
// // //                   <span />
// // //                   <span />
// // //                   <span />
// // //                 </div>

// // //               )}


// // //               <div
// // //                 ref={
// // //                   messagesEndRef
// // //                 }
// // //               />

// // //             </div>


// // //             {media && (

// // //               <div
// // //                 className="media-preview-bar"
// // //               >

// // //                 <span>
// // //                   Attachment:{' '}
// // //                   {
// // //                     media.name
// // //                   }
// // //                 </span>


// // //                 <button
// // //                   onClick={() =>
// // //                     setMedia(
// // //                       null
// // //                     )
// // //                   }
// // //                 >
// // //                   ×
// // //                 </button>

// // //               </div>

// // //             )}


// // //             <form
// // //               className="composer"
// // //               onSubmit={
// // //                 handleSend
// // //               }
// // //             >

// // //               <label
// // //                 className="composer-icon"
// // //                 title="Attach photo/video"
// // //               >

// // //                 ＋


// // //                 <input
// // //                   ref={
// // //                     fileRef
// // //                   }
// // //                   type="file"
// // //                   accept="image/*,video/*"
// // //                   hidden
// // //                   onChange={(
// // //                     event
// // //                   ) =>
// // //                     setMedia(
// // //                       event
// // //                         .target
// // //                         .files?.[0] ||
// // //                         null
// // //                     )
// // //                   }
// // //                 />

// // //               </label>


// // //               <input
// // //                 value={
// // //                   text
// // //                 }
// // //                 onChange={(
// // //                   event
// // //                 ) =>
// // //                   onTypingChange(
// // //                     event
// // //                       .target
// // //                       .value
// // //                   )
// // //                 }
// // //                 placeholder="Type a message"
// // //               />


// // //               <button
// // //                 className="send-button"
// // //                 disabled={
// // //                   sending ||
// // //                   (
// // //                     !text.trim() &&
// // //                     !media
// // //                   )
// // //                 }
// // //               >

// // //                 {sending
// // //                   ? '…'
// // //                   : '➤'}

// // //               </button>

// // //             </form>

// // //           </>

// // //         ) : (

// // //           <div
// // //             className="welcome-pane"
// // //           >

// // //             <div
// // //               className="welcome-graphic"
// // //             >
// // //               💬
// // //             </div>


// // //             <h1>
// // //               WhatsApp Clone
// // //             </h1>


// // //             <p>
// // //               Send and receive messages without keeping your phone connected. Choose a contact to begin.
// // //             </p>


// // //             <small>
// // //               🔒 Built as a full-stack learning project.
// // //             </small>

// // //           </div>

// // //         )}

// // //       </main>


// // //       {/* STATUS MODAL */}

// // //       {openStatus && (

// // //         <div
// // //           className="modal-backdrop"
// // //           onClick={() =>
// // //             setOpenStatus(
// // //               null
// // //             )
// // //           }
// // //         >

// // //           <div
// // //             className="status-viewer"
// // //             onClick={(
// // //               event
// // //             ) =>
// // //               event
// // //                 .stopPropagation()
// // //             }
// // //           >

// // //             <div
// // //               className="status-viewer-head"
// // //             >

// // //               <div>

// // //                 <img
// // //                   src={avatarOf(
// // //                     openStatus.user
// // //                   )}
// // //                   alt=""
// // //                 />


// // //                 <span>

// // //                   <strong>

// // //                     {openStatus
// // //                       .user
// // //                       ?.username ||
// // //                       'Status'}

// // //                   </strong>


// // //                   <small>

// // //                     {formatTime(
// // //                       openStatus.createdAt
// // //                     )}

// // //                   </small>

// // //                 </span>

// // //               </div>


// // //               <button
// // //                 onClick={() =>
// // //                   setOpenStatus(
// // //                     null
// // //                   )
// // //                 }
// // //               >
// // //                 ×
// // //               </button>

// // //             </div>


// // //             <div
// // //               className="status-content"
// // //             >

// // //               {openStatus.contentType ===
// // //                 'image' && (

// // //                 <img
// // //                   src={
// // //                     openStatus.mediaUrl
// // //                   }
// // //                   alt="Status"
// // //                 />

// // //               )}


// // //               {openStatus.contentType ===
// // //                 'video' && (

// // //                 <video
// // //                   src={
// // //                     openStatus.mediaUrl
// // //                   }
// // //                   controls
// // //                   autoPlay
// // //                 />

// // //               )}


// // //               {openStatus.content && (

// // //                 <p>
// // //                   {
// // //                     openStatus.content
// // //                   }
// // //                 </p>

// // //               )}

// // //             </div>


// // //             {idOf(
// // //               openStatus.user
// // //             ) ===
// // //               idOf(
// // //                 currentUser
// // //               ) && (

// // //               <div
// // //                 className="status-footer"
// // //               >

// // //                 <span>

// // //                   👁{' '}

// // //                   {openStatus
// // //                     .viewers
// // //                     ?.length ||
// // //                     0}

// // //                   {' '}views

// // //                 </span>


// // //                 <button
// // //                   onClick={() =>
// // //                     removeStatus(
// // //                       openStatus._id
// // //                     )
// // //                   }
// // //                 >
// // //                   Delete status
// // //                 </button>

// // //               </div>

// // //             )}

// // //           </div>

// // //         </div>

// // //       )}


// // //       {/* PROFILE MODAL */}

// // //       {profileOpen && (

// // //         <div
// // //           className="modal-backdrop"
// // //           onClick={() =>
// // //             setProfileOpen(
// // //               false
// // //             )
// // //           }
// // //         >

// // //           <form
// // //             className="profile-modal"
// // //             onSubmit={
// // //               saveProfile
// // //             }
// // //             onClick={(
// // //               event
// // //             ) =>
// // //               event
// // //                 .stopPropagation()
// // //             }
// // //           >

// // //             <div
// // //               className="modal-title"
// // //             >

// // //               <h3>
// // //                 Profile
// // //               </h3>


// // //               <button
// // //                 type="button"
// // //                 onClick={() =>
// // //                   setProfileOpen(
// // //                     false
// // //                   )
// // //                 }
// // //               >
// // //                 ×
// // //               </button>

// // //             </div>


// // //             <img
// // //               className="profile-large"
// // //               src={
// // //                 profilePhoto
// // //                   ? URL.createObjectURL(
// // //                       profilePhoto
// // //                     )
// // //                   : avatarOf(
// // //                       currentUser
// // //                     )
// // //               }
// // //               alt="Profile"
// // //             />


// // //             <label
// // //               className="attach-label profile-photo-label"
// // //             >

// // //               Change photo


// // //               <input
// // //                 type="file"
// // //                 accept="image/*"
// // //                 hidden
// // //                 onChange={(
// // //                   event
// // //                 ) =>
// // //                   setProfilePhoto(
// // //                     event
// // //                       .target
// // //                       .files?.[0] ||
// // //                       null
// // //                   )
// // //                 }
// // //               />

// // //             </label>


// // //             <label>

// // //               Name


// // //               <input
// // //                 value={
// // //                   profileName
// // //                 }
// // //                 onChange={(
// // //                   event
// // //                 ) =>
// // //                   setProfileName(
// // //                     event
// // //                       .target
// // //                       .value
// // //                   )
// // //                 }
// // //                 maxLength={
// // //                   40
// // //                 }
// // //               />

// // //             </label>


// // //             <label>

// // //               About


// // //               <textarea
// // //                 value={
// // //                   profileAbout
// // //                 }
// // //                 onChange={(
// // //                   event
// // //                 ) =>
// // //                   setProfileAbout(
// // //                     event
// // //                       .target
// // //                       .value
// // //                   )
// // //                 }
// // //                 maxLength={
// // //                   140
// // //                 }
// // //                 rows={
// // //                   3
// // //                 }
// // //               />

// // //             </label>


// // //             <button
// // //               className="primary-btn"
// // //             >
// // //               Save profile
// // //             </button>

// // //           </form>

// // //         </div>

// // //       )}

// // //     </div>
// // //   );
// // // }

// // import React, { useEffect, useMemo, useRef, useState } from 'react';
// // import { toast } from 'react-toastify';

// // import useUserStore from '../../store/useUserStore';
// // import useThemeStore from '../../store/useThemeStore';

// // import {
// //   getAllUser,
// //   logoutUser,
// //   updateUserProfile,
// //   removeUserFromList,
// // } from '../../api/authApi';

// // import {
// //   deleteMessage,
// //   getMessages,
// //   reactToMessage,
// //   sendMessage,
// // } from '../../api/chatApi';

// // import {
// //   createStatus,
// //   deleteStatus,
// //   getStatuses,
// //   markStatusViewed,
// // } from '../../api/statusApi';

// // import {
// //   disconnectSocket,
// //   getSocket,
// // } from '../../utils/socket';


// // const fallbackAvatar = (user) =>
// //   `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(
// //     user?.username || user?._id || 'user'
// //   )}`;


// // const avatarOf = (user) =>
// //   user?.profilepicture ||
// //   user?.profilePicture ||
// //   fallbackAvatar(user);


// // const idOf = (value) =>
// //   String(value?._id || value || '');


// // function formatTime(value) {
// //   if (!value) return '';

// //   const date = new Date(value);
// //   const now = new Date();

// //   if (
// //     date.toDateString() ===
// //     now.toDateString()
// //   ) {
// //     return date.toLocaleTimeString([], {
// //       hour: '2-digit',
// //       minute: '2-digit',
// //     });
// //   }

// //   return date.toLocaleDateString([], {
// //     day: '2-digit',
// //     month: 'short',
// //   });
// // }


// // function lastSeenText(user) {
// //   if (user?.isOnline) {
// //     return 'online';
// //   }

// //   if (!user?.lastSeen) {
// //     return 'offline';
// //   }

// //   return `last seen ${new Date(
// //     user.lastSeen
// //   ).toLocaleString([], {
// //     dateStyle: 'short',
// //     timeStyle: 'short',
// //   })}`;
// // }


// // function messagePreview(item) {
// //   const message =
// //     item?.conversation?.lastMessage;

// //   if (!message) {
// //     return (
// //       item?.about ||
// //       'Start a conversation'
// //     );
// //   }

// //   if (message.deletedForEveryone) {
// //     return 'Message deleted';
// //   }

// //   if (message.contentType === 'image') {
// //     return '📷 Photo';
// //   }

// //   if (message.contentType === 'video') {
// //     return '🎥 Video';
// //   }

// //   return message.content || 'Message';
// // }


// // const rtcConfiguration = {
// //   iceServers: [
// //     {
// //       urls:
// //         'stun:stun.l.google.com:19302',
// //     },
// //     {
// //       urls:
// //         'stun:stun1.l.google.com:19302',
// //     },
// //   ],
// // };


// // export default function Home() {

// //   const currentUser =
// //     useUserStore((state) => state.user);

// //   const setCurrentUser =
// //     useUserStore(
// //       (state) => state.setUser
// //     );

// //   const clearUser =
// //     useUserStore(
// //       (state) => state.clearUser
// //     );

// //   const {
// //     theme,
// //     toggleTheme,
// //   } = useThemeStore();


// //   const [activeTab, setActiveTab] =
// //     useState('chats');

// //   const [users, setUsers] =
// //     useState([]);

// //   const usersRef =
// //     useRef([]);


// //   const [
// //     selectedUser,
// //     setSelectedUser,
// //   ] = useState(null);

// //   const selectedUserRef =
// //     useRef(null);


// //   const [
// //     conversationId,
// //     setConversationId,
// //   ] = useState(null);


// //   const [messages, setMessages] =
// //     useState([]);

// //   const [search, setSearch] =
// //     useState('');

// //   const [text, setText] =
// //     useState('');

// //   const [media, setMedia] =
// //     useState(null);

// //   const [sending, setSending] =
// //     useState(false);

// //   const [typing, setTyping] =
// //     useState(false);


// //   const [statuses, setStatuses] =
// //     useState([]);

// //   const [statusText, setStatusText] =
// //     useState('');

// //   const [
// //     statusMedia,
// //     setStatusMedia,
// //   ] = useState(null);

// //   const [
// //     openStatus,
// //     setOpenStatus,
// //   ] = useState(null);


// //   const [
// //     profileOpen,
// //     setProfileOpen,
// //   ] = useState(false);

// //   const [
// //     profileName,
// //     setProfileName,
// //   ] = useState(
// //     currentUser?.username || ''
// //   );

// //   const [
// //     profileAbout,
// //     setProfileAbout,
// //   ] = useState(
// //     currentUser?.about || ''
// //   );

// //   const [
// //     profilePhoto,
// //     setProfilePhoto,
// //   ] = useState(null);


// //   const messagesEndRef =
// //     useRef(null);

// //   const fileRef =
// //     useRef(null);

// //   const typingTimer =
// //     useRef(null);

// //   const socketRef =
// //     useRef(null);


// //   // =====================================================
// //   // VIDEO CALL STATE
// //   // =====================================================

// //   const localVideoRef =
// //     useRef(null);

// //   const remoteVideoRef =
// //     useRef(null);

// //   const peerConnectionRef =
// //     useRef(null);

// //   const localStreamRef =
// //     useRef(null);

// //   const remoteStreamRef =
// //     useRef(null);

// //   const activeCallPeerRef =
// //     useRef(null);

// //   const pendingIceCandidatesRef =
// //     useRef([]);


// //   const [
// //     callState,
// //     setCallState,
// //   ] = useState('idle');


// //   const [
// //     incomingCall,
// //     setIncomingCall,
// //   ] = useState(null);


// //   const [
// //     activeCallUser,
// //     setActiveCallUser,
// //   ] = useState(null);


// //   // =====================================================
// //   // KEEP REFS UPDATED
// //   // =====================================================

// //   useEffect(() => {
// //     selectedUserRef.current =
// //       selectedUser;
// //   }, [selectedUser]);


// //   useEffect(() => {
// //     usersRef.current =
// //       users;
// //   }, [users]);


// //   // =====================================================
// //   // LOAD USERS
// //   // =====================================================

// //   const loadUsers = async () => {

// //     try {

// //       const result =
// //         await getAllUser();

// //       const list =
// //         result?.data || [];

// //       setUsers(list);


// //       const selectedId =
// //         idOf(
// //           selectedUserRef.current
// //         );


// //       if (selectedId) {

// //         const fresh =
// //           list.find(
// //             (user) =>
// //               idOf(user) ===
// //               selectedId
// //           );


// //         if (fresh) {

// //           setSelectedUser(
// //             fresh
// //           );

// //           selectedUserRef.current =
// //             fresh;
// //         }
// //       }

// //     } catch (error) {

// //       toast.error(
// //         error.message
// //       );
// //     }
// //   };


// //   // =====================================================
// //   // LOAD STATUS
// //   // =====================================================

// //   const loadStatuses = async () => {

// //     try {

// //       setStatuses(
// //         await getStatuses()
// //       );

// //     } catch (error) {

// //       toast.error(
// //         error.message
// //       );
// //     }
// //   };


// //   useEffect(() => {

// //     loadUsers();

// //     loadStatuses();


// //     const userInterval =
// //       setInterval(
// //         loadUsers,
// //         15000
// //       );


// //     return () =>
// //       clearInterval(
// //         userInterval
// //       );

// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, []);


// //   // =====================================================
// //   // VIDEO CALL - CLEANUP
// //   // =====================================================

// //   function cleanupVideoCall(
// //     notifyOtherUser = false
// //   ) {

// //     const peerId =
// //       activeCallPeerRef.current;


// //     if (
// //       notifyOtherUser &&
// //       peerId
// //     ) {

// //       socketRef.current?.emit(
// //         'video_call_end',
// //         {
// //           to:
// //             peerId,
// //         }
// //       );
// //     }


// //     if (
// //       peerConnectionRef.current
// //     ) {

// //       peerConnectionRef.current
// //         .onicecandidate =
// //         null;

// //       peerConnectionRef.current
// //         .ontrack =
// //         null;

// //       peerConnectionRef.current
// //         .onconnectionstatechange =
// //         null;


// //       peerConnectionRef.current
// //         .close();


// //       peerConnectionRef.current =
// //         null;
// //     }


// //     if (
// //       localStreamRef.current
// //     ) {

// //       localStreamRef.current
// //         .getTracks()
// //         .forEach(
// //           (track) => {
// //             track.stop();
// //           }
// //         );


// //       localStreamRef.current =
// //         null;
// //     }


// //     if (
// //       remoteStreamRef.current
// //     ) {

// //       remoteStreamRef.current
// //         .getTracks()
// //         .forEach(
// //           (track) => {
// //             try {
// //               track.stop();
// //             } catch (_) {}
// //           }
// //         );


// //       remoteStreamRef.current =
// //         null;
// //     }


// //     if (
// //       localVideoRef.current
// //     ) {
// //       localVideoRef.current.srcObject =
// //         null;
// //     }


// //     if (
// //       remoteVideoRef.current
// //     ) {
// //       remoteVideoRef.current.srcObject =
// //         null;
// //     }


// //     pendingIceCandidatesRef.current =
// //       [];


// //     activeCallPeerRef.current =
// //       null;


// //     setIncomingCall(
// //       null
// //     );

// //     setActiveCallUser(
// //       null
// //     );

// //     setCallState(
// //       'idle'
// //     );
// //   }


// //   // =====================================================
// //   // VIDEO CALL - CAMERA + MICROPHONE
// //   // =====================================================

// //   async function openLocalMedia() {

// //     if (
// //       localStreamRef.current
// //     ) {
// //       return localStreamRef.current;
// //     }


// //     if (
// //       !navigator.mediaDevices ||
// //       !navigator.mediaDevices.getUserMedia
// //     ) {

// //       throw new Error(
// //         'Camera is not available. Use HTTPS and allow camera/microphone permission.'
// //       );
// //     }


// //     const stream =
// //       await navigator.mediaDevices
// //         .getUserMedia({
// //           video: {
// //             facingMode:
// //               'user',
// //           },

// //           audio: true,
// //         });


// //     localStreamRef.current =
// //       stream;


// //     if (
// //       localVideoRef.current
// //     ) {

// //       localVideoRef.current.srcObject =
// //         stream;
// //     }


// //     return stream;
// //   }


// //   // =====================================================
// //   // VIDEO CALL - CREATE WEBRTC CONNECTION
// //   // =====================================================

// //   function createPeerConnection(
// //     peerUserId
// //   ) {

// //     if (
// //       peerConnectionRef.current
// //     ) {

// //       try {

// //         peerConnectionRef.current
// //           .close();

// //       } catch (_) {}
// //     }


// //     const peer =
// //       new RTCPeerConnection(
// //         rtcConfiguration
// //       );


// //     peerConnectionRef.current =
// //       peer;


// //     // Send network candidate to other user
// //     peer.onicecandidate = (
// //       event
// //     ) => {

// //       if (
// //         !event.candidate
// //       ) {
// //         return;
// //       }


// //       socketRef.current?.emit(
// //         'video_call_ice',
// //         {
// //           to:
// //             peerUserId,

// //           candidate:
// //             event.candidate,
// //         }
// //       );
// //     };


// //     // Receive other user's camera + audio
// //     peer.ontrack = (
// //       event
// //     ) => {

// //       let remoteStream =
// //         event.streams?.[0];


// //       if (!remoteStream) {

// //         if (
// //           !remoteStreamRef.current
// //         ) {

// //           remoteStreamRef.current =
// //             new MediaStream();
// //         }


// //         const alreadyAdded =
// //           remoteStreamRef.current
// //             .getTracks()
// //             .some(
// //               (track) =>
// //                 track.id ===
// //                 event.track.id
// //             );


// //         if (!alreadyAdded) {

// //           remoteStreamRef.current
// //             .addTrack(
// //               event.track
// //             );
// //         }


// //         remoteStream =
// //           remoteStreamRef.current;

// //       } else {

// //         remoteStreamRef.current =
// //           remoteStream;
// //       }


// //       if (
// //         remoteVideoRef.current
// //       ) {

// //         remoteVideoRef.current.srcObject =
// //           remoteStream;
// //       }
// //     };


// //     peer.onconnectionstatechange =
// //       () => {

// //         if (
// //           peer.connectionState ===
// //           'connected'
// //         ) {

// //           setCallState(
// //             'connected'
// //           );
// //         }


// //         if (
// //           peer.connectionState ===
// //           'failed'
// //         ) {

// //           cleanupVideoCall(
// //             false
// //           );


// //           toast.error(
// //             'Video call connection failed'
// //           );
// //         }
// //       };


// //     return peer;
// //   }


// //   // =====================================================
// //   // VIDEO CALL - PENDING ICE
// //   // =====================================================

// //   async function flushIceCandidates() {

// //     const peer =
// //       peerConnectionRef.current;


// //     if (
// //       !peer ||
// //       !peer.remoteDescription
// //     ) {
// //       return;
// //     }


// //     const candidates =
// //       pendingIceCandidatesRef.current;


// //     pendingIceCandidatesRef.current =
// //       [];


// //     for (
// //       const candidate
// //       of candidates
// //     ) {

// //       try {

// //         await peer.addIceCandidate(
// //           candidate
// //         );

// //       } catch (error) {

// //         console.error(
// //           'ICE candidate error:',
// //           error
// //         );
// //       }
// //     }
// //   }


// //   // =====================================================
// //   // VIDEO CALL - START CALL
// //   // =====================================================

// //   async function startVideoCall() {

// //     if (
// //       !selectedUser ||
// //       callState !== 'idle'
// //     ) {
// //       return;
// //     }


// //     try {

// //       const socket =
// //         socketRef.current ||
// //         await getSocket();


// //       socketRef.current =
// //         socket;


// //       // Make sure this socket joined user's room
// //       socket.emit(
// //         'user_connected',
// //         currentUser._id
// //       );


// //       const peerId =
// //         idOf(
// //           selectedUser
// //         );


// //       activeCallPeerRef.current =
// //         peerId;


// //       setActiveCallUser(
// //         selectedUser
// //       );


// //       setCallState(
// //         'calling'
// //       );


// //       const stream =
// //         await openLocalMedia();


// //       const peer =
// //         createPeerConnection(
// //           peerId
// //         );


// //       stream
// //         .getTracks()
// //         .forEach(
// //           (track) => {

// //             peer.addTrack(
// //               track,
// //               stream
// //             );
// //           }
// //         );


// //       const offer =
// //         await peer.createOffer({
// //           offerToReceiveAudio:
// //             true,

// //           offerToReceiveVideo:
// //             true,
// //         });


// //       await peer.setLocalDescription(
// //         offer
// //       );


// //       socket.emit(
// //         'video_call_offer',
// //         {
// //           to:
// //             peerId,

// //           offer:
// //             peer.localDescription,
// //         }
// //       );

// //     } catch (error) {

// //       console.error(
// //         'Start video call:',
// //         error
// //       );


// //       cleanupVideoCall(
// //         false
// //       );


// //       toast.error(
// //         error?.message ||
// //         'Unable to start video call'
// //       );
// //     }
// //   }


// //   // =====================================================
// //   // VIDEO CALL - ACCEPT
// //   // =====================================================

// //   async function acceptVideoCall() {

// //     if (
// //       !incomingCall?.from ||
// //       !incomingCall?.offer
// //     ) {
// //       return;
// //     }


// //     try {

// //       const {
// //         from,
// //         offer,
// //       } =
// //         incomingCall;


// //       activeCallPeerRef.current =
// //         String(from);


// //       setCallState(
// //         'connecting'
// //       );


// //       const stream =
// //         await openLocalMedia();


// //       const peer =
// //         createPeerConnection(
// //           String(from)
// //         );


// //       stream
// //         .getTracks()
// //         .forEach(
// //           (track) => {

// //             peer.addTrack(
// //               track,
// //               stream
// //             );
// //           }
// //         );


// //       await peer.setRemoteDescription(
// //         offer
// //       );


// //       await flushIceCandidates();


// //       const answer =
// //         await peer.createAnswer();


// //       await peer.setLocalDescription(
// //         answer
// //       );


// //       socketRef.current?.emit(
// //         'video_call_answer',
// //         {
// //           to:
// //             String(from),

// //           answer:
// //             peer.localDescription,
// //         }
// //       );


// //       setIncomingCall(
// //         null
// //       );

// //     } catch (error) {

// //       console.error(
// //         'Accept video call:',
// //         error
// //       );


// //       cleanupVideoCall(
// //         false
// //       );


// //       toast.error(
// //         error?.message ||
// //         'Unable to accept video call'
// //       );
// //     }
// //   }


// //   // =====================================================
// //   // VIDEO CALL - REJECT
// //   // =====================================================

// //   function rejectVideoCall() {

// //     const callerId =
// //       incomingCall?.from ||
// //       activeCallPeerRef.current;


// //     if (callerId) {

// //       socketRef.current?.emit(
// //         'video_call_reject',
// //         {
// //           to:
// //             String(
// //               callerId
// //             ),

// //           reason:
// //             'rejected',
// //         }
// //       );
// //     }


// //     cleanupVideoCall(
// //       false
// //     );
// //   }


// //   // =====================================================
// //   // VIDEO CALL - END
// //   // =====================================================

// //   function endVideoCall() {

// //     cleanupVideoCall(
// //       true
// //     );
// //   }


// //   // =====================================================
// //   // ATTACH STREAMS WHEN VIDEO ELEMENT APPEARS
// //   // =====================================================

// //   useEffect(() => {

// //     if (
// //       localVideoRef.current &&
// //       localStreamRef.current
// //     ) {

// //       localVideoRef.current.srcObject =
// //         localStreamRef.current;
// //     }


// //     if (
// //       remoteVideoRef.current &&
// //       remoteStreamRef.current
// //     ) {

// //       remoteVideoRef.current.srcObject =
// //         remoteStreamRef.current;
// //     }

// //   }, [
// //     callState,
// //     incomingCall,
// //   ]);


// //   // =====================================================
// //   // SOCKET
// //   // =====================================================

// //   useEffect(() => {

// //     if (
// //       !currentUser?._id
// //     ) {
// //       return;
// //     }


// //     let mounted =
// //       true;

// //     let socket;


// //     getSocket()
// //       .then(
// //         (socketInstance) => {

// //           if (!mounted) {
// //             return;
// //           }


// //           socket =
// //             socketInstance;


// //           socketRef.current =
// //             socketInstance;


// //           socketInstance.emit(
// //             'user_connected',
// //             currentUser._id
// //           );


// //           // =================================================
// //           // NORMAL CHAT SOCKET EVENTS
// //           // =================================================

// //           const onReceive = (
// //             message
// //           ) => {

// //             const peer =
// //               selectedUserRef.current;

// //             const peerId =
// //               idOf(peer);

// //             const senderId =
// //               idOf(
// //                 message.sender
// //               );


// //             if (
// //               peerId &&
// //               senderId ===
// //                 peerId
// //             ) {

// //               setMessages(
// //                 (
// //                   previousMessages
// //                 ) =>

// //                   previousMessages.some(
// //                     (item) =>
// //                       idOf(item) ===
// //                       idOf(message)
// //                   )

// //                     ? previousMessages

// //                     : [
// //                         ...previousMessages,
// //                         message,
// //                       ]
// //               );
// //             }


// //             loadUsers();
// //           };


// //           const onUpdated =
// //             () => {

// //               loadUsers();
// //             };


// //           const onUserStatus = ({
// //             userId,
// //             isOnline,
// //             lastSeen,
// //           }) => {

// //             setUsers(
// //               (
// //                 previousUsers
// //               ) =>

// //                 previousUsers.map(
// //                   (user) =>

// //                     idOf(user) ===
// //                     String(userId)

// //                       ? {
// //                           ...user,
// //                           isOnline,
// //                           lastSeen,
// //                         }

// //                       : user
// //                 )
// //             );


// //             setSelectedUser(
// //               (
// //                 previousUser
// //               ) =>

// //                 previousUser &&
// //                 idOf(
// //                   previousUser
// //                 ) ===
// //                   String(userId)

// //                   ? {
// //                       ...previousUser,
// //                       isOnline,
// //                       lastSeen,
// //                     }

// //                   : previousUser
// //             );
// //           };


// //           const onTyping = ({
// //             userId,
// //             isTyping,
// //           }) => {

// //             if (
// //               idOf(
// //                 selectedUserRef.current
// //               ) ===
// //               String(userId)
// //             ) {

// //               setTyping(
// //                 Boolean(
// //                   isTyping
// //                 )
// //               );
// //             }
// //           };


// //           const onReaction = (
// //             updated
// //           ) => {

// //             setMessages(
// //               (
// //                 previousMessages
// //               ) =>

// //                 previousMessages.map(
// //                   (message) =>

// //                     idOf(message) ===
// //                     idOf(updated)

// //                       ? updated

// //                       : message
// //                 )
// //             );
// //           };


// //           const onDeleted = ({
// //             messageId,
// //           }) => {

// //             setMessages(
// //               (
// //                 previousMessages
// //               ) =>

// //                 previousMessages.map(
// //                   (message) =>

// //                     idOf(message) ===
// //                     String(messageId)

// //                       ? {
// //                           ...message,

// //                           deletedForEveryone:
// //                             true,

// //                           content:
// //                             '',

// //                           mediaUrl:
// //                             '',

// //                           reactions:
// //                             [],
// //                         }

// //                       : message
// //                 )
// //             );
// //           };


// //           const onStatus =
// //             () => {

// //               loadStatuses();
// //             };


// //           const onStatusUpdate = ({
// //             messageIds,
// //             messageStatus,
// //           }) => {

// //             const ids =
// //               new Set(
// //                 (
// //                   messageIds ||
// //                   []
// //                 ).map(
// //                   String
// //                 )
// //               );


// //             setMessages(
// //               (
// //                 previousMessages
// //               ) =>

// //                 previousMessages.map(
// //                   (message) =>

// //                     ids.has(
// //                       idOf(
// //                         message
// //                       )
// //                     )

// //                       ? {
// //                           ...message,
// //                           messageStatus,
// //                         }

// //                       : message
// //                 )
// //             );
// //           };


// //           // =================================================
// //           // VIDEO CALL - INCOMING
// //           // =================================================

// //           const onIncomingVideoCall =
// //             ({
// //               from,
// //               offer,
// //             }) => {

// //               if (
// //                 !from ||
// //                 !offer
// //               ) {
// //                 return;
// //               }


// //               // Already talking to someone else
// //               if (
// //                 activeCallPeerRef.current &&
// //                 activeCallPeerRef.current !==
// //                   String(from)
// //               ) {

// //                 socketInstance.emit(
// //                   'video_call_reject',
// //                   {
// //                     to:
// //                       String(from),

// //                     reason:
// //                       'busy',
// //                   }
// //                 );


// //                 return;
// //               }


// //               activeCallPeerRef.current =
// //                 String(from);


// //               const caller =
// //                 usersRef.current.find(
// //                   (user) =>
// //                     idOf(user) ===
// //                     String(from)
// //                 );


// //               setActiveCallUser(
// //                 caller || {
// //                   _id:
// //                     String(from),

// //                   username:
// //                     'Incoming call',
// //                 }
// //               );


// //               setIncomingCall({
// //                 from:
// //                   String(from),

// //                 offer,
// //               });


// //               setCallState(
// //                 'incoming'
// //               );
// //             };


// //           // =================================================
// //           // VIDEO CALL - ANSWER RECEIVED
// //           // =================================================

// //           const onVideoCallAccepted =
// //             async ({
// //               from,
// //               answer,
// //             }) => {

// //               if (
// //                 !answer ||
// //                 String(from) !==
// //                   String(
// //                     activeCallPeerRef.current
// //                   )
// //               ) {

// //                 return;
// //               }


// //               const peer =
// //                 peerConnectionRef.current;


// //               if (!peer) {
// //                 return;
// //               }


// //               try {

// //                 await peer
// //                   .setRemoteDescription(
// //                     answer
// //                   );


// //                 await flushIceCandidates();


// //                 setCallState(
// //                   'connected'
// //                 );

// //               } catch (error) {

// //                 console.error(
// //                   'Video answer error:',
// //                   error
// //                 );


// //                 cleanupVideoCall(
// //                   false
// //                 );


// //                 toast.error(
// //                   'Unable to connect video call'
// //                 );
// //               }
// //             };


// //           // =================================================
// //           // VIDEO CALL - ICE
// //           // =================================================

// //           const onVideoCallIce =
// //             async ({
// //               from,
// //               candidate,
// //             }) => {

// //               if (
// //                 !candidate
// //               ) {
// //                 return;
// //               }


// //               if (
// //                 String(from) !==
// //                 String(
// //                   activeCallPeerRef.current
// //                 )
// //               ) {

// //                 return;
// //               }


// //               const peer =
// //                 peerConnectionRef.current;


// //               if (
// //                 peer &&
// //                 peer.remoteDescription
// //               ) {

// //                 try {

// //                   await peer
// //                     .addIceCandidate(
// //                       candidate
// //                     );

// //                 } catch (error) {

// //                   console.error(
// //                     'ICE candidate error:',
// //                     error
// //                   );
// //                 }

// //               } else {

// //                 pendingIceCandidatesRef.current
// //                   .push(
// //                     candidate
// //                   );
// //               }
// //             };


// //           // =================================================
// //           // VIDEO CALL - REJECTED
// //           // =================================================

// //           const onVideoCallRejected =
// //             ({
// //               reason,
// //             }) => {

// //               cleanupVideoCall(
// //                 false
// //               );


// //               if (
// //                 reason ===
// //                 'busy'
// //               ) {

// //                 toast.info(
// //                   'User is busy on another call'
// //                 );

// //               } else {

// //                 toast.info(
// //                   'Video call declined'
// //                 );
// //               }
// //             };


// //           // =================================================
// //           // VIDEO CALL - OTHER USER ENDED
// //           // =================================================

// //           const onVideoCallEnded =
// //             () => {

// //               cleanupVideoCall(
// //                 false
// //               );


// //               toast.info(
// //                 'Video call ended'
// //               );
// //             };


// //           // =================================================
// //           // REGISTER NORMAL SOCKET EVENTS
// //           // =================================================

// //           socketInstance.on(
// //             'receive_message',
// //             onReceive
// //           );

// //           socketInstance.on(
// //             'conversation_updated',
// //             onUpdated
// //           );

// //           socketInstance.on(
// //             'user_status',
// //             onUserStatus
// //           );

// //           socketInstance.on(
// //             'user_typing',
// //             onTyping
// //           );

// //           socketInstance.on(
// //             'reaction_update',
// //             onReaction
// //           );

// //           socketInstance.on(
// //             'message_deleted',
// //             onDeleted
// //           );

// //           socketInstance.on(
// //             'status_updated',
// //             onStatus
// //           );

// //           socketInstance.on(
// //             'message_status_update',
// //             onStatusUpdate
// //           );


// //           // =================================================
// //           // REGISTER VIDEO CALL EVENTS
// //           // =================================================

// //           socketInstance.on(
// //             'video_call_incoming',
// //             onIncomingVideoCall
// //           );

// //           socketInstance.on(
// //             'video_call_accepted',
// //             onVideoCallAccepted
// //           );

// //           socketInstance.on(
// //             'video_call_ice',
// //             onVideoCallIce
// //           );

// //           socketInstance.on(
// //             'video_call_rejected',
// //             onVideoCallRejected
// //           );

// //           socketInstance.on(
// //             'video_call_ended',
// //             onVideoCallEnded
// //           );


// //           // =================================================
// //           // SOCKET CLEANUP
// //           // =================================================

// //           socketInstance
// //             .__cleanupWhatsapp =
// //             () => {

// //               socketInstance.off(
// //                 'receive_message',
// //                 onReceive
// //               );

// //               socketInstance.off(
// //                 'conversation_updated',
// //                 onUpdated
// //               );

// //               socketInstance.off(
// //                 'user_status',
// //                 onUserStatus
// //               );

// //               socketInstance.off(
// //                 'user_typing',
// //                 onTyping
// //               );

// //               socketInstance.off(
// //                 'reaction_update',
// //                 onReaction
// //               );

// //               socketInstance.off(
// //                 'message_deleted',
// //                 onDeleted
// //               );

// //               socketInstance.off(
// //                 'status_updated',
// //                 onStatus
// //               );

// //               socketInstance.off(
// //                 'message_status_update',
// //                 onStatusUpdate
// //               );


// //               socketInstance.off(
// //                 'video_call_incoming',
// //                 onIncomingVideoCall
// //               );

// //               socketInstance.off(
// //                 'video_call_accepted',
// //                 onVideoCallAccepted
// //               );

// //               socketInstance.off(
// //                 'video_call_ice',
// //                 onVideoCallIce
// //               );

// //               socketInstance.off(
// //                 'video_call_rejected',
// //                 onVideoCallRejected
// //               );

// //               socketInstance.off(
// //                 'video_call_ended',
// //                 onVideoCallEnded
// //               );
// //             };
// //         }
// //       )

// //       .catch(
// //         (error) => {

// //           console.error(
// //             'Socket connection error:',
// //             error
// //           );
// //         }
// //       );


// //     return () => {

// //       mounted =
// //         false;


// //       if (
// //         socket
// //           ?.__cleanupWhatsapp
// //       ) {

// //         socket
// //           .__cleanupWhatsapp();
// //       }
// //     };

// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [
// //     currentUser?._id,
// //   ]);


// //   // =====================================================
// //   // VIDEO RESOURCE CLEANUP ON PAGE UNMOUNT
// //   // =====================================================

// //   useEffect(() => {

// //     return () => {

// //       try {

// //         peerConnectionRef.current
// //           ?.close();

// //       } catch (_) {}


// //       localStreamRef.current
// //         ?.getTracks()
// //         .forEach(
// //           (track) => {
// //             track.stop();
// //           }
// //         );
// //     };

// //   }, []);


// //   // =====================================================
// //   // AUTO SCROLL MESSAGES
// //   // =====================================================

// //   useEffect(() => {

// //     messagesEndRef.current
// //       ?.scrollIntoView({
// //         behavior:
// //           'smooth',

// //         block:
// //           'nearest',

// //         inline:
// //           'nearest',
// //       });

// //   }, [
// //     messages,
// //     typing,
// //   ]);


// //   // =====================================================
// //   // SELECT USER
// //   // =====================================================

// //   async function selectUser(
// //     user
// //   ) {

// //     setSelectedUser(
// //       user
// //     );

// //     selectedUserRef.current =
// //       user;

// //     setTyping(
// //       false
// //     );


// //     const cid =
// //       user
// //         ?.conversation
// //         ?._id ||
// //       null;


// //     setConversationId(
// //       cid
// //     );

// //     setMessages([]);


// //     if (cid) {

// //       try {

// //         const data =
// //           await getMessages(
// //             cid
// //           );


// //         setMessages(
// //           data
// //         );


// //         loadUsers();

// //       } catch (error) {

// //         toast.error(
// //           error.message
// //         );
// //       }
// //     }
// //   }


// //   // =====================================================
// //   // REMOVE USER
// //   // =====================================================

// //   async function handleRemoveUser(
// //     user,
// //     event
// //   ) {

// //     event
// //       ?.stopPropagation();


// //     const userName =
// //       user?.username ||
// //       user?.fullPhoneNumber ||
// //       'this user';


// //     const confirmed =
// //       window.confirm(
// //         `Remove ${userName} from your chat list?`
// //       );


// //     if (!confirmed) {
// //       return;
// //     }


// //     try {

// //       if (
// //         activeCallPeerRef.current ===
// //         idOf(user)
// //       ) {

// //         cleanupVideoCall(
// //           true
// //         );
// //       }


// //       await removeUserFromList(
// //         user._id
// //       );


// //       setUsers(
// //         (
// //           previousUsers
// //         ) =>

// //           previousUsers.filter(
// //             (item) =>
// //               idOf(item) !==
// //               idOf(user)
// //           )
// //       );


// //       if (
// //         idOf(
// //           selectedUserRef.current
// //         ) ===
// //         idOf(user)
// //       ) {

// //         setSelectedUser(
// //           null
// //         );

// //         selectedUserRef.current =
// //           null;

// //         setConversationId(
// //           null
// //         );

// //         setMessages([]);

// //         setTyping(
// //           false
// //         );
// //       }


// //       toast.success(
// //         'User removed from chat list'
// //       );

// //     } catch (error) {

// //       toast.error(
// //         error.message ||
// //         'Unable to remove user'
// //       );
// //     }
// //   }


// //   // =====================================================
// //   // SEND MESSAGE
// //   // =====================================================

// //   async function handleSend(
// //     event
// //   ) {

// //     event
// //       ?.preventDefault();


// //     if (
// //       !selectedUser ||
// //       (
// //         !text.trim() &&
// //         !media
// //       ) ||
// //       sending
// //     ) {

// //       return;
// //     }


// //     setSending(
// //       true
// //     );


// //     try {

// //       const result =
// //         await sendMessage(
// //           selectedUser._id,
// //           text.trim(),
// //           media
// //         );


// //       if (
// //         result?.message
// //       ) {

// //         setMessages(
// //           (
// //             previousMessages
// //           ) =>

// //             previousMessages.some(
// //               (message) =>
// //                 idOf(message) ===
// //                 idOf(
// //                   result.message
// //                 )
// //             )

// //               ? previousMessages

// //               : [
// //                   ...previousMessages,
// //                   result.message,
// //                 ]
// //         );
// //       }


// //       if (
// //         result
// //           ?.conversationId
// //       ) {

// //         setConversationId(
// //           String(
// //             result
// //               .conversationId
// //           )
// //         );
// //       }


// //       setText('');

// //       setMedia(
// //         null
// //       );


// //       if (
// //         fileRef.current
// //       ) {

// //         fileRef.current.value =
// //           '';
// //       }


// //       socketRef.current
// //         ?.emit(
// //           'typing_stop',
// //           {
// //             receiverId:
// //               selectedUser._id,

// //             conversationId:
// //               result
// //                 ?.conversationId ||
// //               conversationId,
// //           }
// //         );


// //       loadUsers();

// //     } catch (error) {

// //       toast.error(
// //         error.message
// //       );

// //     } finally {

// //       setSending(
// //         false
// //       );
// //     }
// //   }


// //   // =====================================================
// //   // TYPING
// //   // =====================================================

// //   function onTypingChange(
// //     value
// //   ) {

// //     setText(
// //       value
// //     );


// //     if (!selectedUser) {
// //       return;
// //     }


// //     socketRef.current
// //       ?.emit(
// //         'typing_start',
// //         {
// //           receiverId:
// //             selectedUser._id,

// //           conversationId,
// //         }
// //       );


// //     clearTimeout(
// //       typingTimer.current
// //     );


// //     typingTimer.current =
// //       setTimeout(
// //         () => {

// //           socketRef.current
// //             ?.emit(
// //               'typing_stop',
// //               {
// //                 receiverId:
// //                   selectedUser._id,

// //                 conversationId,
// //               }
// //             );

// //         },
// //         900
// //       );
// //   }


// //   // =====================================================
// //   // REACTION
// //   // =====================================================

// //   async function handleReaction(
// //     messageId,
// //     emoji
// //   ) {

// //     try {

// //       const updated =
// //         await reactToMessage(
// //           messageId,
// //           emoji
// //         );


// //       setMessages(
// //         (
// //           previousMessages
// //         ) =>

// //           previousMessages.map(
// //             (message) =>

// //               idOf(message) ===
// //               idOf(updated)

// //                 ? updated

// //                 : message
// //           )
// //       );

// //     } catch (error) {

// //       toast.error(
// //         error.message
// //       );
// //     }
// //   }


// //   // =====================================================
// //   // DELETE MESSAGE
// //   // =====================================================

// //   async function handleDelete(
// //     messageId
// //   ) {

// //     try {

// //       await deleteMessage(
// //         messageId
// //       );


// //       setMessages(
// //         (
// //           previousMessages
// //         ) =>

// //           previousMessages.map(
// //             (message) =>

// //               idOf(message) ===
// //               String(messageId)

// //                 ? {
// //                     ...message,

// //                     deletedForEveryone:
// //                       true,

// //                     content:
// //                       '',

// //                     mediaUrl:
// //                       '',

// //                     reactions:
// //                       [],
// //                   }

// //                 : message
// //           )
// //       );


// //       loadUsers();

// //     } catch (error) {

// //       toast.error(
// //         error.message
// //       );
// //     }
// //   }


// //   // =====================================================
// //   // CREATE STATUS
// //   // =====================================================

// //   async function handleCreateStatus(
// //     event
// //   ) {

// //     event
// //       .preventDefault();


// //     if (
// //       !statusText.trim() &&
// //       !statusMedia
// //     ) {

// //       return;
// //     }


// //     try {

// //       await createStatus(
// //         statusText.trim(),
// //         statusMedia
// //       );


// //       setStatusText('');

// //       setStatusMedia(
// //         null
// //       );


// //       await loadStatuses();


// //       toast.success(
// //         'Status posted'
// //       );

// //     } catch (error) {

// //       toast.error(
// //         error.message
// //       );
// //     }
// //   }


// //   // =====================================================
// //   // VIEW STATUS
// //   // =====================================================

// //   async function viewStatus(
// //     status
// //   ) {

// //     setOpenStatus(
// //       status
// //     );


// //     if (
// //       idOf(
// //         status.user
// //       ) !==
// //       idOf(
// //         currentUser
// //       )
// //     ) {

// //       await markStatusViewed(
// //         status._id
// //       );
// //     }


// //     loadStatuses();
// //   }


// //   // =====================================================
// //   // DELETE STATUS
// //   // =====================================================

// //   async function removeStatus(
// //     statusId
// //   ) {

// //     try {

// //       await deleteStatus(
// //         statusId
// //       );


// //       setOpenStatus(
// //         null
// //       );


// //       loadStatuses();

// //     } catch (error) {

// //       toast.error(
// //         error.message
// //       );
// //     }
// //   }


// //   // =====================================================
// //   // SAVE PROFILE
// //   // =====================================================

// //   async function saveProfile(
// //     event
// //   ) {

// //     event
// //       .preventDefault();


// //     const form =
// //       new FormData();


// //     form.append(
// //       'username',
// //       profileName.trim()
// //     );


// //     form.append(
// //       'about',
// //       profileAbout.trim()
// //     );


// //     if (
// //       profilePhoto
// //     ) {

// //       form.append(
// //         'profilepicture',
// //         profilePhoto
// //       );
// //     }


// //     try {

// //       const result =
// //         await updateUserProfile(
// //           form
// //         );


// //       setCurrentUser(
// //         result.data
// //       );


// //       setProfileOpen(
// //         false
// //       );


// //       setProfilePhoto(
// //         null
// //       );


// //       toast.success(
// //         'Profile updated'
// //       );

// //     } catch (error) {

// //       toast.error(
// //         error.message
// //       );
// //     }
// //   }


// //   // =====================================================
// //   // LOGOUT
// //   // =====================================================

// //   async function handleLogout() {

// //     if (
// //       activeCallPeerRef.current
// //     ) {

// //       cleanupVideoCall(
// //         true
// //       );
// //     }


// //     try {

// //       await logoutUser();

// //     } catch (_) {}


// //     disconnectSocket();

// //     clearUser();


// //     window.location.href =
// //       '/user-login';
// //   }


// //   // =====================================================
// //   // FILTER USERS
// //   // =====================================================

// //   const filteredUsers =
// //     useMemo(
// //       () => {

// //         const query =
// //           search
// //             .toLowerCase()
// //             .trim();


// //         return users.filter(
// //           (user) => {

// //             if (!query) {
// //               return true;
// //             }


// //             const value =
// //               `${
// //                 user.username ||
// //                 ''
// //               } ${
// //                 user.fullPhoneNumber ||
// //                 ''
// //               } ${
// //                 user.about ||
// //                 ''
// //               }`
// //                 .toLowerCase();


// //             return value.includes(
// //               query
// //             );
// //           }
// //         );

// //       },
// //       [
// //         users,
// //         search,
// //       ]
// //     );


// //   // =====================================================
// //   // GROUP STATUS
// //   // =====================================================

// //   const groupedStatuses =
// //     useMemo(
// //       () => {

// //         const map =
// //           new Map();


// //         statuses.forEach(
// //           (status) => {

// //             const key =
// //               idOf(
// //                 status.user
// //               );


// //             if (
// //               !map.has(
// //                 key
// //               )
// //             ) {

// //               map.set(
// //                 key,
// //                 {
// //                   user:
// //                     status.user,

// //                   items:
// //                     [],
// //                 }
// //               );
// //             }


// //             map
// //               .get(
// //                 key
// //               )
// //               .items
// //               .push(
// //                 status
// //               );
// //           }
// //         );


// //         return [
// //           ...map.values(),
// //         ];

// //       },
// //       [
// //         statuses,
// //       ]
// //     );


// //   // =====================================================
// //   // UI
// //   // =====================================================

// //   return (

// //     <div
// //       className={`whatsapp-shell ${
// //         theme ===
// //         'dark'
// //           ? 'dark'
// //           : ''
// //       }`}
// //     >


// //       {/* LEFT ICON RAIL */}

// //       <aside
// //         className="icon-rail"
// //       >

// //         <button
// //           className="profile-icon"
// //           onClick={() =>
// //             setProfileOpen(
// //               true
// //             )
// //           }
// //           title="Profile"
// //         >

// //           <img
// //             src={avatarOf(
// //               currentUser
// //             )}
// //             alt="Me"
// //           />

// //         </button>


// //         <button
// //           className={
// //             activeTab ===
// //             'chats'
// //               ? 'rail-active'
// //               : ''
// //           }
// //           onClick={() =>
// //             setActiveTab(
// //               'chats'
// //             )
// //           }
// //           title="Chats"
// //         >

// //           💬

// //         </button>


// //         <button
// //           className={
// //             activeTab ===
// //             'status'
// //               ? 'rail-active'
// //               : ''
// //           }
// //           onClick={() =>
// //             setActiveTab(
// //               'status'
// //             )
// //           }
// //           title="Status"
// //         >

// //           ◉

// //         </button>


// //         <div
// //           className="rail-spacer"
// //         />


// //         <button
// //           onClick={
// //             toggleTheme
// //           }
// //           title="Theme"
// //         >

// //           {theme ===
// //           'dark'
// //             ? '☀'
// //             : '☾'}

// //         </button>


// //         <button
// //           onClick={
// //             handleLogout
// //           }
// //           title="Logout"
// //         >

// //           ↪

// //         </button>

// //       </aside>


// //       {/* CHAT SIDEBAR */}

// //       <section
// //         className={`sidebar-panel ${
// //           selectedUser
// //             ? 'mobile-hidden'
// //             : ''
// //         }`}
// //       >

// //         {activeTab ===
// //         'chats' ? (

// //           <>

// //             <div
// //               className="sidebar-header"
// //             >

// //               <h2>
// //                 Chats
// //               </h2>


// //               <button
// //                 className="round-button"
// //                 onClick={
// //                   loadUsers
// //                 }
// //               >

// //                 ↻

// //               </button>

// //             </div>


// //             <div
// //               className="search-box"
// //             >

// //               ⌕


// //               <input
// //                 value={
// //                   search
// //                 }
// //                 onChange={(
// //                   event
// //                 ) =>
// //                   setSearch(
// //                     event
// //                       .target
// //                       .value
// //                   )
// //                 }
// //                 placeholder="Search or start new chat"
// //               />

// //             </div>


// //             <div
// //               className="contact-list"
// //             >

// //               {filteredUsers
// //                 .length ===
// //                 0 && (

// //                 <div
// //                   className="empty-small"
// //                 >

// //                   No other verified users yet.

// //                 </div>
// //               )}


// //               {filteredUsers.map(
// //                 (user) => (

// //                   <div
// //                     className="contact-row-wrapper"
// //                     key={
// //                       user._id
// //                     }
// //                   >


// //                     <button
// //                       type="button"
// //                       className={`contact-row ${
// //                         idOf(
// //                           selectedUser
// //                         ) ===
// //                         idOf(
// //                           user
// //                         )
// //                           ? 'selected'
// //                           : ''
// //                       }`}
// //                       onClick={() =>
// //                         selectUser(
// //                           user
// //                         )
// //                       }
// //                     >


// //                       <div
// //                         className="avatar-wrap"
// //                       >

// //                         <img
// //                           src={avatarOf(
// //                             user
// //                           )}
// //                           alt=""
// //                         />


// //                         {user.isOnline && (

// //                           <span
// //                             className="online-dot"
// //                           />

// //                         )}

// //                       </div>


// //                       <div
// //                         className="contact-main"
// //                       >

// //                         <div
// //                           className="contact-top"
// //                         >

// //                           <strong>

// //                             {user.username ||
// //                               user.fullPhoneNumber ||
// //                               'WhatsApp user'}

// //                           </strong>


// //                           <span>

// //                             {formatTime(
// //                               user
// //                                 .conversation
// //                                 ?.lastMessage
// //                                 ?.createdAt ||
// //                               user
// //                                 .conversation
// //                                 ?.updatedAt
// //                             )}

// //                           </span>

// //                         </div>


// //                         <div
// //                           className="contact-bottom"
// //                         >

// //                           <span>

// //                             {messagePreview(
// //                               user
// //                             )}

// //                           </span>


// //                           {user.unreadCount >
// //                             0 && (

// //                             <b>
// //                               {
// //                                 user.unreadCount
// //                               }
// //                             </b>

// //                           )}

// //                         </div>

// //                       </div>

// //                     </button>


// //                     {/* REMOVE USER */}

// //                     <button
// //                       type="button"
// //                       className="contact-delete-button"
// //                       title="Remove from chat list"
// //                       aria-label="Remove from chat list"
// //                       onClick={(
// //                         event
// //                       ) =>
// //                         handleRemoveUser(
// //                           user,
// //                           event
// //                         )
// //                       }
// //                     >

// //                       <svg
// //                         viewBox="0 0 24 24"
// //                         aria-hidden="true"
// //                       >

// //                         <path
// //                           d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-2 6h10l-.7 11H7.7L7 9Zm3 2v7h2v-7h-2Zm4 0v7h2v-7h-2Z"
// //                           fill="currentColor"
// //                         />

// //                       </svg>

// //                     </button>

// //                   </div>

// //                 )
// //               )}

// //             </div>

// //           </>

// //         ) : (

// //           <>

// //             <div
// //               className="sidebar-header"
// //             >

// //               <h2>
// //                 Status
// //               </h2>


// //               <button
// //                 className="round-button"
// //                 onClick={
// //                   loadStatuses
// //                 }
// //               >

// //                 ↻

// //               </button>

// //             </div>


// //             <form
// //               className="status-create"
// //               onSubmit={
// //                 handleCreateStatus
// //               }
// //             >

// //               <div
// //                 className="status-me"
// //               >

// //                 <img
// //                   src={avatarOf(
// //                     currentUser
// //                   )}
// //                   alt="Me"
// //                 />


// //                 <div>

// //                   <strong>
// //                     My status
// //                   </strong>

// //                   <small>
// //                     Post text, photo or video
// //                   </small>

// //                 </div>

// //               </div>


// //               <textarea
// //                 value={
// //                   statusText
// //                 }
// //                 onChange={(
// //                   event
// //                 ) =>
// //                   setStatusText(
// //                     event
// //                       .target
// //                       .value
// //                   )
// //                 }
// //                 placeholder="What's happening?"
// //                 rows={3}
// //               />


// //               <div
// //                 className="status-actions"
// //               >

// //                 <label
// //                   className="attach-label"
// //                 >

// //                   ＋ Media


// //                   <input
// //                     type="file"
// //                     accept="image/*,video/*"
// //                     hidden
// //                     onChange={(
// //                       event
// //                     ) =>
// //                       setStatusMedia(
// //                         event
// //                           .target
// //                           .files?.[0] ||
// //                           null
// //                       )
// //                     }
// //                   />

// //                 </label>


// //                 <button
// //                   className="primary-mini"
// //                 >

// //                   Post

// //                 </button>

// //               </div>


// //               {statusMedia && (

// //                 <small
// //                   className="file-chip"
// //                 >

// //                   {statusMedia.name}

// //                 </small>
// //               )}

// //             </form>


// //             <div
// //               className="status-list"
// //             >

// //               {groupedStatuses.map(
// //                 (group) => (

// //                   <button
// //                     className="status-row"
// //                     key={
// //                       idOf(
// //                         group.user
// //                       )
// //                     }
// //                     onClick={() =>
// //                       viewStatus(
// //                         group.items[0]
// //                       )
// //                     }
// //                   >

// //                     <div
// //                       className="status-ring"
// //                     >

// //                       <img
// //                         src={avatarOf(
// //                           group.user
// //                         )}
// //                         alt=""
// //                       />

// //                     </div>


// //                     <div>

// //                       <strong>

// //                         {idOf(
// //                           group.user
// //                         ) ===
// //                         idOf(
// //                           currentUser
// //                         )

// //                           ? 'My status'

// //                           : (
// //                               group.user
// //                                 ?.username ||
// //                               'User'
// //                             )}

// //                       </strong>


// //                       <small>

// //                         {group.items.length}{' '}

// //                         update

// //                         {group.items.length >
// //                         1
// //                           ? 's'
// //                           : ''}

// //                         {' '}·{' '}

// //                         {formatTime(
// //                           group
// //                             .items[0]
// //                             .createdAt
// //                         )}

// //                       </small>

// //                     </div>

// //                   </button>
// //                 )
// //               )}


// //               {!groupedStatuses
// //                 .length && (

// //                 <div
// //                   className="empty-small"
// //                 >

// //                   No active status updates.

// //                 </div>
// //               )}

// //             </div>

// //           </>
// //         )}

// //       </section>


// //       {/* CHAT PANEL */}

// //       <main
// //         className={`chat-panel ${
// //           selectedUser
// //             ? 'mobile-visible'
// //             : ''
// //         }`}
// //       >

// //         {selectedUser &&
// //         activeTab ===
// //           'chats' ? (

// //           <>

// //             <header
// //               className="chat-header"
// //             >

// //               <button
// //                 className="mobile-back"
// //                 onClick={() =>
// //                   setSelectedUser(
// //                     null
// //                   )
// //                 }
// //               >

// //                 ←

// //               </button>


// //               <img
// //                 src={avatarOf(
// //                   selectedUser
// //                 )}
// //                 alt=""
// //               />


// //               <div>

// //                 <strong>

// //                   {selectedUser.username ||
// //                     selectedUser.fullPhoneNumber}

// //                 </strong>


// //                 <small>

// //                   {typing
// //                     ? 'typing…'
// //                     : lastSeenText(
// //                         selectedUser
// //                       )}

// //                 </small>

// //               </div>


// //               <div
// //                 className="chat-header-actions"
// //               >


// //                 {/* VIDEO CALL BUTTON */}

// //                 <button
// //                   type="button"
// //                   className="video-call-button"
// //                   title="Video call"
// //                   aria-label="Video call"
// //                   onClick={
// //                     startVideoCall
// //                   }
// //                   disabled={
// //                     callState !==
// //                     'idle'
// //                   }
// //                 >

// //                   <svg
// //                     viewBox="0 0 24 24"
// //                     aria-hidden="true"
// //                   >

// //                     <path
// //                       fill="currentColor"
// //                       d="M4 5h11a2 2 0 0 1 2 2v2.5l4-2.5v10l-4-2.5V17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v10h11V7H4Z"
// //                     />

// //                   </svg>

// //                 </button>


// //                 <button
// //                   type="button"
// //                   title="Search"
// //                 >

// //                   ⌕

// //                 </button>


// //                 <button
// //                   type="button"
// //                   title="More"
// //                 >

// //                   ⋮

// //                 </button>

// //               </div>

// //             </header>


// //             {/* MESSAGES */}

// //             <div
// //               className="messages-area"
// //             >

// //               <div
// //                 className="encryption-note"
// //               >

// //                 🔒 Messages in this demo are delivered through your own backend and database.

// //               </div>


// //               {messages.map(
// //                 (message) => {

// //                   const mine =
// //                     idOf(
// //                       message.sender
// //                     ) ===
// //                     idOf(
// //                       currentUser
// //                     );


// //                   const reactions =
// //                     message.reactions ||
// //                     [];


// //                   return (

// //                     <div
// //                       className={`message-line ${
// //                         mine
// //                           ? 'mine'
// //                           : 'theirs'
// //                       }`}
// //                       key={
// //                         message._id
// //                       }
// //                     >

// //                       <div
// //                         className={`message-bubble ${
// //                           message
// //                             .deletedForEveryone
// //                             ? 'deleted'
// //                             : ''
// //                         }`}
// //                       >

// //                         {message
// //                           .deletedForEveryone ? (

// //                           <em>
// //                             🚫 This message was deleted
// //                           </em>

// //                         ) : (

// //                           <>

// //                             {message
// //                               .contentType ===
// //                               'image' &&
// //                               message
// //                                 .mediaUrl && (

// //                                 <img
// //                                   className="message-media"
// //                                   src={
// //                                     message.mediaUrl
// //                                   }
// //                                   alt="Shared"
// //                                 />

// //                               )}


// //                             {message
// //                               .contentType ===
// //                               'video' &&
// //                               message
// //                                 .mediaUrl && (

// //                                 <video
// //                                   className="message-media"
// //                                   src={
// //                                     message.mediaUrl
// //                                   }
// //                                   controls
// //                                 />

// //                               )}


// //                             {message
// //                               .content && (

// //                               <div
// //                                 className="message-text"
// //                               >

// //                                 {
// //                                   message.content
// //                                 }

// //                               </div>
// //                             )}

// //                           </>
// //                         )}


// //                         <div
// //                           className="message-meta"
// //                         >

// //                           <span>

// //                             {formatTime(
// //                               message
// //                                 .createdAt
// //                             )}

// //                           </span>


// //                           {mine && (

// //                             <span
// //                               className={
// //                                 message
// //                                   .messageStatus ===
// //                                 'read'

// //                                   ? 'status-read'

// //                                   : ''
// //                               }
// //                             >

// //                               {message
// //                                 .messageStatus ===
// //                               'sent'
// //                                 ? '✓'
// //                                 : '✓✓'}

// //                             </span>
// //                           )}

// //                         </div>


// //                         {!message
// //                           .deletedForEveryone && (

// //                           <div
// //                             className="message-tools"
// //                           >

// //                             {[
// //                               '👍',
// //                               '❤️',
// //                               '😂',
// //                             ].map(
// //                               (
// //                                 emoji
// //                               ) => (

// //                                 <button
// //                                   key={
// //                                     emoji
// //                                   }
// //                                   onClick={() =>
// //                                     handleReaction(
// //                                       message._id,
// //                                       emoji
// //                                     )
// //                                   }
// //                                 >

// //                                   {emoji}

// //                                 </button>
// //                               )
// //                             )}


// //                             {mine && (

// //                               <button
// //                                 onClick={() =>
// //                                   handleDelete(
// //                                     message._id
// //                                   )
// //                                 }
// //                               >

// //                                 🗑

// //                               </button>
// //                             )}

// //                           </div>
// //                         )}


// //                         {reactions.length >
// //                           0 && (

// //                           <div
// //                             className="reaction-pill"
// //                           >

// //                             {reactions.map(
// //                               (
// //                                 reaction,
// //                                 index
// //                               ) => (

// //                                 <span
// //                                   key={`${idOf(
// //                                     reaction.user
// //                                   )}-${index}`}
// //                                 >

// //                                   {
// //                                     reaction.emoji
// //                                   }

// //                                 </span>
// //                               )
// //                             )}

// //                           </div>
// //                         )}

// //                       </div>

// //                     </div>
// //                   );
// //                 }
// //               )}


// //               {typing && (

// //                 <div
// //                   className="typing-bubble"
// //                 >

// //                   <span />
// //                   <span />
// //                   <span />

// //                 </div>
// //               )}


// //               <div
// //                 ref={
// //                   messagesEndRef
// //                 }
// //               />

// //             </div>


// //             {/* MEDIA PREVIEW */}

// //             {media && (

// //               <div
// //                 className="media-preview-bar"
// //               >

// //                 <span>
// //                   Attachment: {media.name}
// //                 </span>


// //                 <button
// //                   type="button"
// //                   onClick={() =>
// //                     setMedia(
// //                       null
// //                     )
// //                   }
// //                 >

// //                   ×

// //                 </button>

// //               </div>
// //             )}


// //             {/* MESSAGE COMPOSER */}

// //             <form
// //               className="composer"
// //               onSubmit={
// //                 handleSend
// //               }
// //             >

// //               <label
// //                 className="composer-icon"
// //                 title="Attach photo/video"
// //               >

// //                 ＋


// //                 <input
// //                   ref={
// //                     fileRef
// //                   }
// //                   type="file"
// //                   accept="image/*,video/*"
// //                   hidden
// //                   onChange={(
// //                     event
// //                   ) =>
// //                     setMedia(
// //                       event
// //                         .target
// //                         .files?.[0] ||
// //                         null
// //                     )
// //                   }
// //                 />

// //               </label>


// //               <input
// //                 value={
// //                   text
// //                 }
// //                 onChange={(
// //                   event
// //                 ) =>
// //                   onTypingChange(
// //                     event
// //                       .target
// //                       .value
// //                   )
// //                 }
// //                 placeholder="Type a message"
// //               />


// //               <button
// //                 className="send-button"
// //                 disabled={
// //                   sending ||
// //                   (
// //                     !text.trim() &&
// //                     !media
// //                   )
// //                 }
// //               >

// //                 {sending
// //                   ? '…'
// //                   : '➤'}

// //               </button>

// //             </form>

// //           </>

// //         ) : (

// //           <div
// //             className="welcome-pane"
// //           >

// //             <div
// //               className="welcome-graphic"
// //             >

// //               💬

// //             </div>


// //             <h1>
// //               WhatsApp Clone
// //             </h1>


// //             <p>

// //               Send and receive messages without keeping your phone connected. Choose a contact to begin.

// //             </p>


// //             <small>

// //               🔒 Built as a full-stack learning project.

// //             </small>

// //           </div>
// //         )}

// //       </main>


// //       {/* =================================================
// //           STATUS MODAL
// //           ================================================= */}

// //       {openStatus && (

// //         <div
// //           className="modal-backdrop"
// //           onClick={() =>
// //             setOpenStatus(
// //               null
// //             )
// //           }
// //         >

// //           <div
// //             className="status-viewer"
// //             onClick={(
// //               event
// //             ) =>
// //               event
// //                 .stopPropagation()
// //             }
// //           >

// //             <div
// //               className="status-viewer-head"
// //             >

// //               <div>

// //                 <img
// //                   src={avatarOf(
// //                     openStatus.user
// //                   )}
// //                   alt=""
// //                 />


// //                 <span>

// //                   <strong>

// //                     {openStatus
// //                       .user
// //                       ?.username ||
// //                       'Status'}

// //                   </strong>


// //                   <small>

// //                     {formatTime(
// //                       openStatus
// //                         .createdAt
// //                     )}

// //                   </small>

// //                 </span>

// //               </div>


// //               <button
// //                 type="button"
// //                 onClick={() =>
// //                   setOpenStatus(
// //                     null
// //                   )
// //                 }
// //               >

// //                 ×

// //               </button>

// //             </div>


// //             <div
// //               className="status-content"
// //             >

// //               {openStatus
// //                 .contentType ===
// //                 'image' && (

// //                 <img
// //                   src={
// //                     openStatus
// //                       .mediaUrl
// //                   }
// //                   alt="Status"
// //                 />
// //               )}


// //               {openStatus
// //                 .contentType ===
// //                 'video' && (

// //                 <video
// //                   src={
// //                     openStatus
// //                       .mediaUrl
// //                   }
// //                   controls
// //                   autoPlay
// //                 />
// //               )}


// //               {openStatus
// //                 .content && (

// //                 <p>
// //                   {
// //                     openStatus.content
// //                   }
// //                 </p>
// //               )}

// //             </div>


// //             {idOf(
// //               openStatus.user
// //             ) ===
// //               idOf(
// //                 currentUser
// //               ) && (

// //               <div
// //                 className="status-footer"
// //               >

// //                 <span>

// //                   👁{' '}

// //                   {openStatus
// //                     .viewers
// //                     ?.length ||
// //                     0}{' '}

// //                   views

// //                 </span>


// //                 <button
// //                   type="button"
// //                   onClick={() =>
// //                     removeStatus(
// //                       openStatus._id
// //                     )
// //                   }
// //                 >

// //                   Delete status

// //                 </button>

// //               </div>
// //             )}

// //           </div>

// //         </div>
// //       )}


// //       {/* =================================================
// //           PROFILE MODAL
// //           ================================================= */}

// //       {profileOpen && (

// //         <div
// //           className="modal-backdrop"
// //           onClick={() =>
// //             setProfileOpen(
// //               false
// //             )
// //           }
// //         >

// //           <form
// //             className="profile-modal"
// //             onSubmit={
// //               saveProfile
// //             }
// //             onClick={(
// //               event
// //             ) =>
// //               event
// //                 .stopPropagation()
// //             }
// //           >

// //             <div
// //               className="modal-title"
// //             >

// //               <h3>
// //                 Profile
// //               </h3>


// //               <button
// //                 type="button"
// //                 onClick={() =>
// //                   setProfileOpen(
// //                     false
// //                   )
// //                 }
// //               >

// //                 ×

// //               </button>

// //             </div>


// //             <img
// //               className="profile-large"
// //               src={
// //                 profilePhoto

// //                   ? URL
// //                       .createObjectURL(
// //                         profilePhoto
// //                       )

// //                   : avatarOf(
// //                       currentUser
// //                     )
// //               }
// //               alt="Profile"
// //             />


// //             <label
// //               className="attach-label profile-photo-label"
// //             >

// //               Change photo


// //               <input
// //                 type="file"
// //                 accept="image/*"
// //                 hidden
// //                 onChange={(
// //                   event
// //                 ) =>
// //                   setProfilePhoto(
// //                     event
// //                       .target
// //                       .files?.[0] ||
// //                       null
// //                   )
// //                 }
// //               />

// //             </label>


// //             <label>

// //               Name


// //               <input
// //                 value={
// //                   profileName
// //                 }
// //                 onChange={(
// //                   event
// //                 ) =>
// //                   setProfileName(
// //                     event
// //                       .target
// //                       .value
// //                   )
// //                 }
// //                 maxLength={
// //                   40
// //                 }
// //               />

// //             </label>


// //             <label>

// //               About


// //               <textarea
// //                 value={
// //                   profileAbout
// //                 }
// //                 onChange={(
// //                   event
// //                 ) =>
// //                   setProfileAbout(
// //                     event
// //                       .target
// //                       .value
// //                   )
// //                 }
// //                 maxLength={
// //                   140
// //                 }
// //                 rows={
// //                   3
// //                 }
// //               />

// //             </label>


// //             <button
// //               className="primary-btn"
// //             >

// //               Save profile

// //             </button>

// //           </form>

// //         </div>
// //       )}


// //       {/* =================================================
// //           REAL-TIME VIDEO CALL
// //           ================================================= */}

// //       {callState !==
// //         'idle' && (

// //         <div
// //           className="video-call-overlay"
// //         >

// //           <div
// //             className="video-call-window"
// //           >


// //             {/* INCOMING CALL */}

// //             {callState ===
// //             'incoming' ? (

// //               <div
// //                 className="incoming-call-box"
// //               >

// //                 <img
// //                   className="incoming-call-avatar"
// //                   src={avatarOf(
// //                     activeCallUser
// //                   )}
// //                   alt=""
// //                 />


// //                 <h2>

// //                   {activeCallUser
// //                     ?.username ||
// //                     activeCallUser
// //                       ?.fullPhoneNumber ||
// //                     'User'}

// //                 </h2>


// //                 <p>

// //                   Incoming video call...

// //                 </p>


// //                 <div
// //                   className="incoming-call-actions"
// //                 >

// //                   {/* REJECT */}

// //                   <button
// //                     type="button"
// //                     className="call-reject-button"
// //                     title="Reject"
// //                     onClick={
// //                       rejectVideoCall
// //                     }
// //                   >

// //                     ✕

// //                   </button>


// //                   {/* ACCEPT */}

// //                   <button
// //                     type="button"
// //                     className="call-accept-button"
// //                     title="Accept video call"
// //                     onClick={
// //                       acceptVideoCall
// //                     }
// //                   >

// //                     <svg
// //                       viewBox="0 0 24 24"
// //                       aria-hidden="true"
// //                     >

// //                       <path
// //                         fill="currentColor"
// //                         d="M4 5h11a2 2 0 0 1 2 2v2.5l4-2.5v10l-4-2.5V17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v10h11V7H4Z"
// //                       />

// //                     </svg>

// //                   </button>

// //                 </div>

// //               </div>

// //             ) : (

// //               <>


// //                 {/* CALL HEADER */}

// //                 <div
// //                   className="video-call-header"
// //                 >

// //                   <div>

// //                     <strong>

// //                       {activeCallUser
// //                         ?.username ||
// //                         activeCallUser
// //                           ?.fullPhoneNumber ||
// //                         'Video call'}

// //                     </strong>


// //                     <small>

// //                       {callState ===
// //                       'calling'

// //                         ? 'Calling...'

// //                         : callState ===
// //                           'connecting'

// //                           ? 'Connecting...'

// //                           : 'Connected'}

// //                     </small>

// //                   </div>

// //                 </div>


// //                 {/* VIDEO */}

// //                 <div
// //                   className="remote-video-container"
// //                 >


// //                   {/* REMOTE USER */}

// //                   <video
// //                     ref={
// //                       remoteVideoRef
// //                     }
// //                     className="remote-video"
// //                     autoPlay
// //                     playsInline
// //                   />


// //                   {(callState ===
// //                     'calling' ||
// //                     callState ===
// //                     'connecting') && (

// //                     <div
// //                       className="calling-message"
// //                     >

// //                       {callState ===
// //                       'calling'
// //                         ? 'Calling...'
// //                         : 'Connecting...'}

// //                     </div>
// //                   )}


// //                   {/* LOCAL CAMERA */}

// //                   <video
// //                     ref={
// //                       localVideoRef
// //                     }
// //                     className="local-video"
// //                     autoPlay
// //                     playsInline
// //                     muted
// //                   />

// //                 </div>


// //                 {/* CALL CONTROLS */}

// //                 <div
// //                   className="video-call-controls"
// //                 >

// //                   <button
// //                     type="button"
// //                     className="call-end-button"
// //                     onClick={
// //                       endVideoCall
// //                     }
// //                   >

// //                     ✕ End Call

// //                   </button>

// //                 </div>

// //               </>
// //             )}

// //           </div>

// //         </div>
// //       )}

// //     </div>
// //   );
// // }

// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import { toast } from 'react-toastify';
// import useUserStore from '../../store/useUserStore';
// import useThemeStore from '../../store/useThemeStore';

// import {
//   getAllUser,
//   logoutUser,
//   updateUserProfile,
//   removeUserFromList,
// } from '../../api/authApi';

// import {
//   deleteMessage,
//   getMessages,
//   reactToMessage,
//   sendMessage,
// } from '../../api/chatApi';

// import {
//   createStatus,
//   deleteStatus,
//   getStatuses,
//   markStatusViewed,
// } from '../../api/statusApi';

// import {
//   disconnectSocket,
//   getSocket,
// } from '../../utils/socket';


// const fallbackAvatar = (user) =>
//   `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(
//     user?.username || user?._id || 'user'
//   )}`;


// const avatarOf = (user) =>
//   user?.profilepicture ||
//   user?.profilePicture ||
//   fallbackAvatar(user);


// const idOf = (value) =>
//   String(value?._id || value || '');


// const rtcConfiguration = {
//   iceServers: [
//     {
//       urls:
//         'stun:stun.l.google.com:19302',
//     },
//     {
//       urls:
//         'stun:stun1.l.google.com:19302',
//     },
//   ],
// };


// function formatTime(value) {
//   if (!value) return '';

//   const date = new Date(value);
//   const now = new Date();

//   if (
//     date.toDateString() ===
//     now.toDateString()
//   ) {
//     return date.toLocaleTimeString([], {
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   }

//   return date.toLocaleDateString([], {
//     day: '2-digit',
//     month: 'short',
//   });
// }


// function lastSeenText(user) {
//   if (user?.isOnline) {
//     return 'online';
//   }

//   if (!user?.lastSeen) {
//     return 'offline';
//   }

//   return `last seen ${new Date(
//     user.lastSeen
//   ).toLocaleString([], {
//     dateStyle: 'short',
//     timeStyle: 'short',
//   })}`;
// }


// function messagePreview(item) {
//   const message =
//     item?.conversation?.lastMessage;

//   if (!message) {
//     return (
//       item?.about ||
//       'Start a conversation'
//     );
//   }

//   if (message.deletedForEveryone) {
//     return 'Message deleted';
//   }

//   if (message.contentType === 'image') {
//     return '📷 Photo';
//   }

//   if (message.contentType === 'video') {
//     return '🎥 Video';
//   }

//   return message.content || 'Message';
// }


// export default function Home() {

//   const currentUser =
//     useUserStore(
//       (state) => state.user
//     );

//   const setCurrentUser =
//     useUserStore(
//       (state) => state.setUser
//     );

//   const clearUser =
//     useUserStore(
//       (state) => state.clearUser
//     );


//   const {
//     theme,
//     toggleTheme,
//   } = useThemeStore();


//   const [
//     activeTab,
//     setActiveTab,
//   ] = useState('chats');


//   const [
//     users,
//     setUsers,
//   ] = useState([]);


//   const usersRef =
//     useRef([]);


//   const [
//     selectedUser,
//     setSelectedUser,
//   ] = useState(null);


//   const selectedUserRef =
//     useRef(null);


//   const [
//     conversationId,
//     setConversationId,
//   ] = useState(null);


//   const [
//     messages,
//     setMessages,
//   ] = useState([]);


//   const [
//     search,
//     setSearch,
//   ] = useState('');


//   const [
//     text,
//     setText,
//   ] = useState('');


//   const [
//     media,
//     setMedia,
//   ] = useState(null);


//   const [
//     sending,
//     setSending,
//   ] = useState(false);


//   const [
//     typing,
//     setTyping,
//   ] = useState(false);


//   const [
//     statuses,
//     setStatuses,
//   ] = useState([]);


//   const [
//     statusText,
//     setStatusText,
//   ] = useState('');


//   const [
//     statusMedia,
//     setStatusMedia,
//   ] = useState(null);


//   const [
//     openStatus,
//     setOpenStatus,
//   ] = useState(null);


//   const [
//     profileOpen,
//     setProfileOpen,
//   ] = useState(false);


//   const [
//     profileName,
//     setProfileName,
//   ] = useState(
//     currentUser?.username || ''
//   );


//   const [
//     profileAbout,
//     setProfileAbout,
//   ] = useState(
//     currentUser?.about || ''
//   );


//   const [
//     profilePhoto,
//     setProfilePhoto,
//   ] = useState(null);


//   const messagesEndRef =
//     useRef(null);

//   const fileRef =
//     useRef(null);

//   const typingTimer =
//     useRef(null);

//   const socketRef =
//     useRef(null);


//   // =====================================================
//   // VIDEO CALL REFS
//   // =====================================================

//   const localVideoRef =
//     useRef(null);

//   const remoteVideoRef =
//     useRef(null);

//   const peerConnectionRef =
//     useRef(null);

//   const localStreamRef =
//     useRef(null);

//   const remoteStreamRef =
//     useRef(null);

//   const activeCallPeerRef =
//     useRef(null);

//   const pendingIceCandidatesRef =
//     useRef([]);

//   const mediaRequestRef =
//     useRef(null);

//   const acceptingCallRef =
//     useRef(false);


//   // =====================================================
//   // VIDEO CALL STATE
//   // =====================================================

//   const [
//     callState,
//     setCallState,
//   ] = useState('idle');


//   const [
//     incomingCall,
//     setIncomingCall,
//   ] = useState(null);


//   const [
//     activeCallUser,
//     setActiveCallUser,
//   ] = useState(null);


//   // =====================================================
//   // KEEP REFS UPDATED
//   // =====================================================

//   useEffect(() => {

//     selectedUserRef.current =
//       selectedUser;

//   }, [
//     selectedUser,
//   ]);


//   useEffect(() => {

//     usersRef.current =
//       users;

//   }, [
//     users,
//   ]);


//   // =====================================================
//   // LOAD USERS
//   // =====================================================

//   const loadUsers =
//     async () => {

//       try {

//         const result =
//           await getAllUser();


//         const list =
//           result?.data || [];


//         setUsers(
//           list
//         );


//         const selectedId =
//           idOf(
//             selectedUserRef.current
//           );


//         if (selectedId) {

//           const fresh =
//             list.find(
//               (user) =>
//                 idOf(user) ===
//                 selectedId
//             );


//           if (fresh) {

//             setSelectedUser(
//               fresh
//             );


//             selectedUserRef.current =
//               fresh;
//           }
//         }

//       } catch (error) {

//         toast.error(
//           error.message
//         );
//       }
//     };


//   // =====================================================
//   // LOAD STATUS
//   // =====================================================

//   const loadStatuses =
//     async () => {

//       try {

//         setStatuses(
//           await getStatuses()
//         );

//       } catch (error) {

//         toast.error(
//           error.message
//         );
//       }
//     };


//   useEffect(() => {

//     loadUsers();

//     loadStatuses();


//     const userInterval =
//       setInterval(
//         loadUsers,
//         15000
//       );


//     return () =>
//       clearInterval(
//         userInterval
//       );

//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);


//   // =====================================================
//   // CLEAN VIDEO CALL
//   // =====================================================

//   function cleanupVideoCall(
//     notifyOtherUser = false
//   ) {

//     acceptingCallRef.current =
//       false;


//     mediaRequestRef.current =
//       null;


//     const peerId =
//       activeCallPeerRef.current ||
//       incomingCall?.from;


//     if (
//       notifyOtherUser &&
//       peerId
//     ) {

//       socketRef.current?.emit(
//         'video_call_end',
//         {
//           to:
//             String(peerId),
//         }
//       );
//     }


//     if (
//       peerConnectionRef.current
//     ) {

//       peerConnectionRef.current
//         .onicecandidate =
//         null;


//       peerConnectionRef.current
//         .ontrack =
//         null;


//       peerConnectionRef.current
//         .onconnectionstatechange =
//         null;


//       peerConnectionRef.current
//         .oniceconnectionstatechange =
//         null;


//       try {

//         peerConnectionRef.current
//           .close();

//       } catch (_) {}


//       peerConnectionRef.current =
//         null;
//     }


//     if (
//       localStreamRef.current
//     ) {

//       localStreamRef.current
//         .getTracks()
//         .forEach(
//           (track) => {

//             track.stop();

//           }
//         );


//       localStreamRef.current =
//         null;
//     }


//     remoteStreamRef.current =
//       null;


//     if (
//       localVideoRef.current
//     ) {

//       localVideoRef.current.srcObject =
//         null;
//     }


//     if (
//       remoteVideoRef.current
//     ) {

//       remoteVideoRef.current.srcObject =
//         null;
//     }


//     pendingIceCandidatesRef.current =
//       [];


//     activeCallPeerRef.current =
//       null;


//     setIncomingCall(
//       null
//     );


//     setActiveCallUser(
//       null
//     );


//     setCallState(
//       'idle'
//     );
//   }


//   // =====================================================
//   // OPEN CAMERA + MICROPHONE
//   // FIXES NotReadableError: Device in use
//   // =====================================================

//   async function openLocalMedia() {

//     // Reuse existing live stream
//     if (
//       localStreamRef.current &&
//       localStreamRef.current
//         .getTracks()
//         .some(
//           (track) =>
//             track.readyState ===
//             'live'
//         )
//     ) {

//       return localStreamRef.current;
//     }


//     // Prevent duplicate camera requests
//     if (
//       mediaRequestRef.current
//     ) {

//       return mediaRequestRef.current;
//     }


//     if (
//       !navigator.mediaDevices ||
//       !navigator.mediaDevices.getUserMedia
//     ) {

//       throw new Error(
//         'Camera and microphone are not available. Use HTTPS and allow browser permissions.'
//       );
//     }


//     mediaRequestRef.current =
//       navigator.mediaDevices
//         .getUserMedia({

//           video: {
//             facingMode:
//               'user',
//           },

//           audio:
//             true,

//         })

//         .then(
//           (stream) => {

//             localStreamRef.current =
//               stream;


//             if (
//               localVideoRef.current
//             ) {

//               localVideoRef.current.srcObject =
//                 stream;
//             }


//             return stream;
//           }
//         )

//         .catch(
//           async (
//             error
//           ) => {

//             console.error(
//               'Camera/microphone error:',
//               error
//             );


//             // =============================================
//             // DEVICE ALREADY IN USE
//             // Try microphone only
//             // =============================================

//             if (
//               error?.name ===
//               'NotReadableError'
//             ) {

//               try {

//                 const audioOnlyStream =
//                   await navigator
//                     .mediaDevices
//                     .getUserMedia({

//                       video:
//                         false,

//                       audio:
//                         true,

//                     });


//                 localStreamRef.current =
//                   audioOnlyStream;


//                 toast.info(
//                   'Camera is busy. Call will use microphone only.'
//                 );


//                 return audioOnlyStream;

//               } catch (
//                 audioError
//               ) {

//                 console.error(
//                   'Audio-only fallback failed:',
//                   audioError
//                 );


//                 const deviceError =
//                   new Error(
//                     'Camera or microphone is already being used by another app or browser tab.'
//                   );


//                 deviceError.name =
//                   'NotReadableError';


//                 throw deviceError;
//               }
//             }


//             // =============================================
//             // PERMISSION DENIED
//             // =============================================

//             if (
//               error?.name ===
//               'NotAllowedError'
//             ) {

//               const permissionError =
//                 new Error(
//                   'Camera or microphone permission was denied. Allow camera and microphone in the browser.'
//                 );


//               permissionError.name =
//                 'NotAllowedError';


//               throw permissionError;
//             }


//             // =============================================
//             // NO CAMERA / MICROPHONE
//             // =============================================

//             if (
//               error?.name ===
//               'NotFoundError'
//             ) {

//               const notFoundError =
//                 new Error(
//                   'No camera or microphone was found on this device.'
//                 );


//               notFoundError.name =
//                 'NotFoundError';


//               throw notFoundError;
//             }


//             throw error;
//           }
//         )

//         .finally(
//           () => {

//             mediaRequestRef.current =
//               null;
//           }
//         );


//     return mediaRequestRef.current;
//   }


//   // =====================================================
//   // CREATE WEBRTC CONNECTION
//   // =====================================================

//   function createPeerConnection(
//     peerUserId
//   ) {

//     if (
//       peerConnectionRef.current
//     ) {

//       try {

//         peerConnectionRef.current
//           .close();

//       } catch (_) {}
//     }


//     const peer =
//       new RTCPeerConnection(
//         rtcConfiguration
//       );


//     peerConnectionRef.current =
//       peer;


//     // Send ICE to other user
//     peer.onicecandidate =
//       (
//         event
//       ) => {

//         if (
//           !event.candidate
//         ) {
//           return;
//         }


//         socketRef.current?.emit(
//           'video_call_ice',
//           {

//             to:
//               String(
//                 peerUserId
//               ),

//             candidate:
//               event.candidate,

//           }
//         );
//       };


//     // Receive other user video/audio
//     peer.ontrack =
//       (
//         event
//       ) => {

//         let stream =
//           event.streams?.[0];


//         if (!stream) {

//           if (
//             !remoteStreamRef.current
//           ) {

//             remoteStreamRef.current =
//               new MediaStream();
//           }


//           const exists =
//             remoteStreamRef.current
//               .getTracks()
//               .some(
//                 (track) =>
//                   track.id ===
//                   event.track.id
//               );


//           if (!exists) {

//             remoteStreamRef.current
//               .addTrack(
//                 event.track
//               );
//           }


//           stream =
//             remoteStreamRef.current;

//         } else {

//           remoteStreamRef.current =
//             stream;
//         }


//         if (
//           remoteVideoRef.current
//         ) {

//           remoteVideoRef.current.srcObject =
//             stream;


//           remoteVideoRef.current
//             .play?.()
//             .catch(
//               () => {}
//             );
//         }
//       };


//     peer.onconnectionstatechange =
//       () => {

//         if (
//           peer.connectionState ===
//           'connected'
//         ) {

//           setCallState(
//             'connected'
//           );
//         }


//         if (
//           peer.connectionState ===
//           'failed'
//         ) {

//           cleanupVideoCall(
//             false
//           );


//           toast.error(
//             'Video call connection failed'
//           );
//         }
//       };


//     peer.oniceconnectionstatechange =
//       () => {

//         if (
//           peer.iceConnectionState ===
//           'failed'
//         ) {

//           console.error(
//             'ICE connection failed'
//           );
//         }
//       };


//     return peer;
//   }


//   // =====================================================
//   // ADD ICE CANDIDATES RECEIVED BEFORE ANSWER
//   // =====================================================

//   async function flushIceCandidates() {

//     const peer =
//       peerConnectionRef.current;


//     if (
//       !peer ||
//       !peer.remoteDescription
//     ) {

//       return;
//     }


//     const candidates =
//       pendingIceCandidatesRef.current;


//     pendingIceCandidatesRef.current =
//       [];


//     for (
//       const candidate
//       of candidates
//     ) {

//       try {

//         await peer
//           .addIceCandidate(
//             candidate
//           );

//       } catch (error) {

//         console.error(
//           'ICE candidate error:',
//           error
//         );
//       }
//     }
//   }


//   // =====================================================
//   // START VIDEO CALL
//   // =====================================================

//   async function startVideoCall() {

//     if (
//       !selectedUser ||
//       callState !==
//         'idle'
//     ) {

//       return;
//     }


//     try {

//       const socket =
//         socketRef.current ||
//         await getSocket();


//       socketRef.current =
//         socket;


//       socket.emit(
//         'user_connected',
//         currentUser._id
//       );


//       const peerId =
//         idOf(
//           selectedUser
//         );


//       activeCallPeerRef.current =
//         peerId;


//       setActiveCallUser(
//         selectedUser
//       );


//       setCallState(
//         'calling'
//       );


//       const stream =
//         await openLocalMedia();


//       const peer =
//         createPeerConnection(
//           peerId
//         );


//       stream
//         .getTracks()
//         .forEach(
//           (
//             track
//           ) => {

//             peer.addTrack(
//               track,
//               stream
//             );
//           }
//         );


//       const offer =
//         await peer
//           .createOffer({

//             offerToReceiveAudio:
//               true,

//             offerToReceiveVideo:
//               true,

//           });


//       await peer
//         .setLocalDescription(
//           offer
//         );


//       socket.emit(
//         'video_call_offer',
//         {

//           to:
//             peerId,

//           offer:
//             peer.localDescription,

//         }
//       );

//     } catch (error) {

//       console.error(
//         'Start video call:',
//         error
//       );


//       cleanupVideoCall(
//         false
//       );


//       toast.error(
//         error?.message ||
//         'Unable to start video call'
//       );
//     }
//   }


//   // =====================================================
//   // ACCEPT VIDEO CALL
//   // FIXES DOUBLE ACCEPT + DEVICE IN USE
//   // =====================================================

//   async function acceptVideoCall() {

//     if (
//       !incomingCall?.from ||
//       !incomingCall?.offer
//     ) {

//       return;
//     }


//     // Prevent duplicate Accept
//     if (
//       acceptingCallRef.current
//     ) {

//       return;
//     }


//     acceptingCallRef.current =
//       true;


//     try {

//       const {
//         from,
//         offer,
//       } =
//         incomingCall;


//       activeCallPeerRef.current =
//         String(
//           from
//         );


//       setCallState(
//         'connecting'
//       );


//       let stream =
//         null;


//       try {

//         stream =
//           await openLocalMedia();

//       } catch (
//         mediaError
//       ) {

//         console.error(
//           'Local camera/microphone unavailable:',
//           mediaError
//         );


//         /*
//          * Important:
//          * Do not terminate the whole WebRTC call
//          * just because this user's local camera
//          * is being used by another app/tab.
//          *
//          * The receiver can still receive the
//          * caller's media.
//          */

//         if (
//           [
//             'NotReadableError',
//             'NotAllowedError',
//             'NotFoundError',
//           ].includes(
//             mediaError?.name
//           )
//         ) {

//           toast.warning(
//             `${mediaError.message} Continuing in receive-only mode.`
//           );

//         } else {

//           throw mediaError;
//         }
//       }


//       const peer =
//         createPeerConnection(
//           String(
//             from
//           )
//         );


//       // Add local tracks only if available
//       if (stream) {

//         stream
//           .getTracks()
//           .forEach(
//             (
//               track
//             ) => {

//               peer.addTrack(
//                 track,
//                 stream
//               );
//             }
//           );
//       }


//       await peer
//         .setRemoteDescription(
//           new RTCSessionDescription(
//             offer
//           )
//         );


//       await flushIceCandidates();


//       const answer =
//         await peer
//           .createAnswer();


//       await peer
//         .setLocalDescription(
//           answer
//         );


//       socketRef.current?.emit(
//         'video_call_answer',
//         {

//           to:
//             String(
//               from
//             ),

//           answer:
//             peer.localDescription,

//         }
//       );


//       setIncomingCall(
//         null
//       );

//     } catch (error) {

//       console.error(
//         'Accept video call:',
//         error
//       );


//       cleanupVideoCall(
//         false
//       );


//       toast.error(
//         error?.message ||
//         'Unable to accept video call'
//       );

//     } finally {

//       acceptingCallRef.current =
//         false;
//     }
//   }


//   // =====================================================
//   // REJECT VIDEO CALL
//   // =====================================================

//   function rejectVideoCall() {

//     const callerId =
//       incomingCall?.from ||
//       activeCallPeerRef.current;


//     if (
//       callerId
//     ) {

//       socketRef.current?.emit(
//         'video_call_reject',
//         {

//           to:
//             String(
//               callerId
//             ),

//           reason:
//             'rejected',

//         }
//       );
//     }


//     cleanupVideoCall(
//       false
//     );
//   }


//   // =====================================================
//   // END VIDEO CALL
//   // =====================================================

//   function endVideoCall() {

//     cleanupVideoCall(
//       true
//     );
//   }


//   // =====================================================
//   // ATTACH VIDEO STREAMS
//   // =====================================================

//   useEffect(() => {

//     if (
//       localVideoRef.current &&
//       localStreamRef.current
//     ) {

//       localVideoRef.current.srcObject =
//         localStreamRef.current;


//       localVideoRef.current
//         .play?.()
//         .catch(
//           () => {}
//         );
//     }


//     if (
//       remoteVideoRef.current &&
//       remoteStreamRef.current
//     ) {

//       remoteVideoRef.current.srcObject =
//         remoteStreamRef.current;


//       remoteVideoRef.current
//         .play?.()
//         .catch(
//           () => {}
//         );
//     }

//   }, [
//     callState,
//     incomingCall,
//   ]);


//   // =====================================================
//   // SOCKET
//   // =====================================================

//   useEffect(() => {

//     if (
//       !currentUser?._id
//     ) {

//       return;
//     }


//     let mounted =
//       true;


//     let socket;


//     getSocket()
//       .then(
//         (
//           socketInstance
//         ) => {

//           if (
//             !mounted
//           ) {

//             return;
//           }


//           socket =
//             socketInstance;


//           socketRef.current =
//             socketInstance;


//           socketInstance.emit(
//             'user_connected',
//             currentUser._id
//           );


//           // =============================================
//           // MESSAGE RECEIVED
//           // =============================================

//           const onReceive =
//             (
//               message
//             ) => {

//               const peer =
//                 selectedUserRef.current;


//               const peerId =
//                 idOf(
//                   peer
//                 );


//               const senderId =
//                 idOf(
//                   message.sender
//                 );


//               if (
//                 peerId &&
//                 senderId ===
//                   peerId
//               ) {

//                 setMessages(
//                   (
//                     previousMessages
//                   ) =>

//                     previousMessages.some(
//                       (
//                         item
//                       ) =>

//                         idOf(
//                           item
//                         ) ===
//                         idOf(
//                           message
//                         )
//                     )

//                       ? previousMessages

//                       : [
//                           ...previousMessages,
//                           message,
//                         ]
//                 );
//               }


//               loadUsers();
//             };


//           const onUpdated =
//             () => {

//               loadUsers();
//             };


//           // =============================================
//           // ONLINE STATUS
//           // =============================================

//           const onUserStatus =
//             ({
//               userId,
//               isOnline,
//               lastSeen,
//             }) => {

//               setUsers(
//                 (
//                   previousUsers
//                 ) =>

//                   previousUsers.map(
//                     (
//                       user
//                     ) =>

//                       idOf(
//                         user
//                       ) ===
//                       String(
//                         userId
//                       )

//                         ? {
//                             ...user,
//                             isOnline,
//                             lastSeen,
//                           }

//                         : user
//                   )
//               );


//               setSelectedUser(
//                 (
//                   previousUser
//                 ) =>

//                   previousUser &&
//                   idOf(
//                     previousUser
//                   ) ===
//                     String(
//                       userId
//                     )

//                     ? {
//                         ...previousUser,
//                         isOnline,
//                         lastSeen,
//                       }

//                     : previousUser
//               );
//             };


//           // =============================================
//           // TYPING
//           // =============================================

//           const onTyping =
//             ({
//               userId,
//               isTyping,
//             }) => {

//               if (
//                 idOf(
//                   selectedUserRef.current
//                 ) ===
//                 String(
//                   userId
//                 )
//               ) {

//                 setTyping(
//                   Boolean(
//                     isTyping
//                   )
//                 );
//               }
//             };


//           // =============================================
//           // REACTION
//           // =============================================

//           const onReaction =
//             (
//               updated
//             ) => {

//               setMessages(
//                 (
//                   previousMessages
//                 ) =>

//                   previousMessages.map(
//                     (
//                       message
//                     ) =>

//                       idOf(
//                         message
//                       ) ===
//                       idOf(
//                         updated
//                       )

//                         ? updated

//                         : message
//                   )
//               );
//             };


//           // =============================================
//           // MESSAGE DELETE
//           // =============================================

//           const onDeleted =
//             ({
//               messageId,
//             }) => {

//               setMessages(
//                 (
//                   previousMessages
//                 ) =>

//                   previousMessages.map(
//                     (
//                       message
//                     ) =>

//                       idOf(
//                         message
//                       ) ===
//                       String(
//                         messageId
//                       )

//                         ? {
//                             ...message,

//                             deletedForEveryone:
//                               true,

//                             content:
//                               '',

//                             mediaUrl:
//                               '',

//                             reactions:
//                               [],
//                           }

//                         : message
//                   )
//               );
//             };


//           const onStatus =
//             () => {

//               loadStatuses();
//             };


//           const onStatusUpdate =
//             ({
//               messageIds,
//               messageStatus,
//             }) => {

//               const ids =
//                 new Set(
//                   (
//                     messageIds ||
//                     []
//                   ).map(
//                     String
//                   )
//                 );


//               setMessages(
//                 (
//                   previousMessages
//                 ) =>

//                   previousMessages.map(
//                     (
//                       message
//                     ) =>

//                       ids.has(
//                         idOf(
//                           message
//                         )
//                       )

//                         ? {
//                             ...message,
//                             messageStatus,
//                           }

//                         : message
//                   )
//               );
//             };


//           // =================================================
//           // INCOMING VIDEO CALL
//           // =================================================

//           const onIncomingVideoCall =
//             ({
//               from,
//               offer,
//             }) => {

//               if (
//                 !from ||
//                 !offer
//               ) {

//                 return;
//               }


//               // Already busy
//               if (
//                 activeCallPeerRef.current &&
//                 activeCallPeerRef.current !==
//                   String(
//                     from
//                   )
//               ) {

//                 socketInstance.emit(
//                   'video_call_reject',
//                   {

//                     to:
//                       String(
//                         from
//                       ),

//                     reason:
//                       'busy',

//                   }
//                 );


//                 return;
//               }


//               activeCallPeerRef.current =
//                 String(
//                   from
//                 );


//               const caller =
//                 usersRef.current
//                   .find(
//                     (
//                       user
//                     ) =>

//                       idOf(
//                         user
//                       ) ===
//                       String(
//                         from
//                       )
//                   );


//               setActiveCallUser(
//                 caller || {

//                   _id:
//                     String(
//                       from
//                     ),

//                   username:
//                     'Incoming call',

//                 }
//               );


//               setIncomingCall({

//                 from:
//                   String(
//                     from
//                   ),

//                 offer,

//               });


//               setCallState(
//                 'incoming'
//               );
//             };


//           // =================================================
//           // VIDEO CALL ANSWER
//           // =================================================

//           const onVideoCallAccepted =
//             async ({
//               from,
//               answer,
//             }) => {

//               if (
//                 !answer ||
//                 String(
//                   from
//                 ) !==
//                   String(
//                     activeCallPeerRef.current
//                   )
//               ) {

//                 return;
//               }


//               const peer =
//                 peerConnectionRef.current;


//               if (
//                 !peer
//               ) {

//                 return;
//               }


//               try {

//                 await peer
//                   .setRemoteDescription(
//                     new RTCSessionDescription(
//                       answer
//                     )
//                   );


//                 await flushIceCandidates();


//                 setCallState(
//                   'connected'
//                 );

//               } catch (
//                 error
//               ) {

//                 console.error(
//                   'Video answer error:',
//                   error
//                 );


//                 cleanupVideoCall(
//                   false
//                 );


//                 toast.error(
//                   'Unable to connect video call'
//                 );
//               }
//             };


//           // =================================================
//           // ICE CANDIDATE
//           // =================================================

//           const onVideoCallIce =
//             async ({
//               from,
//               candidate,
//             }) => {

//               if (
//                 !candidate
//               ) {

//                 return;
//               }


//               if (
//                 String(
//                   from
//                 ) !==
//                 String(
//                   activeCallPeerRef.current
//                 )
//               ) {

//                 return;
//               }


//               const peer =
//                 peerConnectionRef.current;


//               if (
//                 peer &&
//                 peer.remoteDescription
//               ) {

//                 try {

//                   await peer
//                     .addIceCandidate(
//                       candidate
//                     );

//                 } catch (
//                   error
//                 ) {

//                   console.error(
//                     'ICE candidate error:',
//                     error
//                   );
//                 }

//               } else {

//                 pendingIceCandidatesRef.current
//                   .push(
//                     candidate
//                   );
//               }
//             };


//           // =================================================
//           // CALL REJECTED
//           // =================================================

//           const onVideoCallRejected =
//             ({
//               reason,
//             }) => {

//               cleanupVideoCall(
//                 false
//               );


//               if (
//                 reason ===
//                 'busy'
//               ) {

//                 toast.info(
//                   'User is busy on another call'
//                 );

//               } else {

//                 toast.info(
//                   'Video call declined'
//                 );
//               }
//             };


//           // =================================================
//           // CALL ENDED
//           // =================================================

//           const onVideoCallEnded =
//             () => {

//               cleanupVideoCall(
//                 false
//               );


//               toast.info(
//                 'Video call ended'
//               );
//             };


//           // =================================================
//           // REGISTER CHAT SOCKET EVENTS
//           // =================================================

//           socketInstance.on(
//             'receive_message',
//             onReceive
//           );


//           socketInstance.on(
//             'conversation_updated',
//             onUpdated
//           );


//           socketInstance.on(
//             'user_status',
//             onUserStatus
//           );


//           socketInstance.on(
//             'user_typing',
//             onTyping
//           );


//           socketInstance.on(
//             'reaction_update',
//             onReaction
//           );


//           socketInstance.on(
//             'message_deleted',
//             onDeleted
//           );


//           socketInstance.on(
//             'status_updated',
//             onStatus
//           );


//           socketInstance.on(
//             'message_status_update',
//             onStatusUpdate
//           );


//           // =================================================
//           // REGISTER VIDEO CALL EVENTS
//           // =================================================

//           socketInstance.on(
//             'video_call_incoming',
//             onIncomingVideoCall
//           );


//           socketInstance.on(
//             'video_call_accepted',
//             onVideoCallAccepted
//           );


//           socketInstance.on(
//             'video_call_ice',
//             onVideoCallIce
//           );


//           socketInstance.on(
//             'video_call_rejected',
//             onVideoCallRejected
//           );


//           socketInstance.on(
//             'video_call_ended',
//             onVideoCallEnded
//           );


//           // =================================================
//           // CLEAN SOCKET LISTENERS
//           // =================================================

//           socketInstance
//             .__cleanupWhatsapp =
//             () => {

//               socketInstance.off(
//                 'receive_message',
//                 onReceive
//               );


//               socketInstance.off(
//                 'conversation_updated',
//                 onUpdated
//               );


//               socketInstance.off(
//                 'user_status',
//                 onUserStatus
//               );


//               socketInstance.off(
//                 'user_typing',
//                 onTyping
//               );


//               socketInstance.off(
//                 'reaction_update',
//                 onReaction
//               );


//               socketInstance.off(
//                 'message_deleted',
//                 onDeleted
//               );


//               socketInstance.off(
//                 'status_updated',
//                 onStatus
//               );


//               socketInstance.off(
//                 'message_status_update',
//                 onStatusUpdate
//               );


//               socketInstance.off(
//                 'video_call_incoming',
//                 onIncomingVideoCall
//               );


//               socketInstance.off(
//                 'video_call_accepted',
//                 onVideoCallAccepted
//               );


//               socketInstance.off(
//                 'video_call_ice',
//                 onVideoCallIce
//               );


//               socketInstance.off(
//                 'video_call_rejected',
//                 onVideoCallRejected
//               );


//               socketInstance.off(
//                 'video_call_ended',
//                 onVideoCallEnded
//               );
//             };
//         }
//       )

//       .catch(
//         (
//           error
//         ) => {

//           console.error(
//             'Socket connection error:',
//             error
//           );
//         }
//       );


//     return () => {

//       mounted =
//         false;


//       if (
//         socket
//           ?.__cleanupWhatsapp
//       ) {

//         socket
//           .__cleanupWhatsapp();
//       }
//     };

//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [
//     currentUser?._id,
//   ]);


//   // =====================================================
//   // CLEAN CAMERA ON PAGE CLOSE
//   // =====================================================

//   useEffect(() => {

//     return () => {

//       acceptingCallRef.current =
//         false;


//       mediaRequestRef.current =
//         null;


//       try {

//         peerConnectionRef.current
//           ?.close();

//       } catch (_) {}


//       localStreamRef.current
//         ?.getTracks()
//         .forEach(
//           (
//             track
//           ) => {

//             track.stop();

//           }
//         );
//     };

//   }, []);


//   // =====================================================
//   // AUTO SCROLL
//   // =====================================================

//   useEffect(() => {

//     messagesEndRef.current
//       ?.scrollIntoView({

//         behavior:
//           'smooth',

//         block:
//           'nearest',

//         inline:
//           'nearest',

//       });

//   }, [
//     messages,
//     typing,
//   ]);


//   // =====================================================
//   // SELECT USER
//   // =====================================================

//   async function selectUser(
//     user
//   ) {

//     setSelectedUser(
//       user
//     );


//     selectedUserRef.current =
//       user;


//     setTyping(
//       false
//     );


//     const cid =
//       user
//         ?.conversation
//         ?._id ||
//       null;


//     setConversationId(
//       cid
//     );


//     setMessages(
//       []
//     );


//     if (
//       cid
//     ) {

//       try {

//         const data =
//           await getMessages(
//             cid
//           );


//         setMessages(
//           data
//         );


//         loadUsers();

//       } catch (
//         error
//       ) {

//         toast.error(
//           error.message
//         );
//       }
//     }
//   }


//   // =====================================================
//   // REMOVE USER
//   // =====================================================

//   async function handleRemoveUser(
//     user,
//     event
//   ) {

//     event
//       ?.stopPropagation();


//     const userName =
//       user?.username ||
//       user?.fullPhoneNumber ||
//       'this user';


//     const confirmed =
//       window.confirm(
//         `Remove ${userName} from your chat list?`
//       );


//     if (
//       !confirmed
//     ) {

//       return;
//     }


//     try {

//       if (
//         activeCallPeerRef.current ===
//         idOf(
//           user
//         )
//       ) {

//         cleanupVideoCall(
//           true
//         );
//       }


//       await removeUserFromList(
//         user._id
//       );


//       setUsers(
//         (
//           previousUsers
//         ) =>

//           previousUsers.filter(
//             (
//               item
//             ) =>

//               idOf(
//                 item
//               ) !==
//               idOf(
//                 user
//               )
//           )
//       );


//       if (
//         idOf(
//           selectedUserRef.current
//         ) ===
//         idOf(
//           user
//         )
//       ) {

//         setSelectedUser(
//           null
//         );


//         selectedUserRef.current =
//           null;


//         setConversationId(
//           null
//         );


//         setMessages(
//           []
//         );


//         setTyping(
//           false
//         );
//       }


//       toast.success(
//         'User removed from chat list'
//       );

//     } catch (
//       error
//     ) {

//       toast.error(
//         error.message ||
//         'Unable to remove user'
//       );
//     }
//   }


//   // =====================================================
//   // SEND MESSAGE
//   // =====================================================

//   async function handleSend(
//     event
//   ) {

//     event
//       ?.preventDefault();


//     if (
//       !selectedUser ||
//       (
//         !text.trim() &&
//         !media
//       ) ||
//       sending
//     ) {

//       return;
//     }


//     setSending(
//       true
//     );


//     try {

//       const result =
//         await sendMessage(

//           selectedUser._id,

//           text.trim(),

//           media

//         );


//       if (
//         result?.message
//       ) {

//         setMessages(
//           (
//             previousMessages
//           ) =>

//             previousMessages.some(
//               (
//                 message
//               ) =>

//                 idOf(
//                   message
//                 ) ===
//                 idOf(
//                   result.message
//                 )
//             )

//               ? previousMessages

//               : [
//                   ...previousMessages,
//                   result.message,
//                 ]
//         );
//       }


//       if (
//         result
//           ?.conversationId
//       ) {

//         setConversationId(
//           String(
//             result
//               .conversationId
//           )
//         );
//       }


//       setText(
//         ''
//       );


//       setMedia(
//         null
//       );


//       if (
//         fileRef.current
//       ) {

//         fileRef.current.value =
//           '';
//       }


//       socketRef.current?.emit(
//         'typing_stop',
//         {

//           receiverId:
//             selectedUser._id,

//           conversationId:
//             result
//               ?.conversationId ||
//             conversationId,

//         }
//       );


//       loadUsers();

//     } catch (
//       error
//     ) {

//       toast.error(
//         error.message
//       );

//     } finally {

//       setSending(
//         false
//       );
//     }
//   }


//   // =====================================================
//   // TYPING
//   // =====================================================

//   function onTypingChange(
//     value
//   ) {

//     setText(
//       value
//     );


//     if (
//       !selectedUser
//     ) {

//       return;
//     }


//     socketRef.current?.emit(
//       'typing_start',
//       {

//         receiverId:
//           selectedUser._id,

//         conversationId,

//       }
//     );


//     clearTimeout(
//       typingTimer.current
//     );


//     typingTimer.current =
//       setTimeout(
//         () => {

//           socketRef.current?.emit(
//             'typing_stop',
//             {

//               receiverId:
//                 selectedUser._id,

//               conversationId,

//             }
//           );

//         },
//         900
//       );
//   }


//   // =====================================================
//   // REACTION
//   // =====================================================

//   async function handleReaction(
//     messageId,
//     emoji
//   ) {

//     try {

//       const updated =
//         await reactToMessage(
//           messageId,
//           emoji
//         );


//       setMessages(
//         (
//           previousMessages
//         ) =>

//           previousMessages.map(
//             (
//               message
//             ) =>

//               idOf(
//                 message
//               ) ===
//               idOf(
//                 updated
//               )

//                 ? updated

//                 : message
//           )
//       );

//     } catch (
//       error
//     ) {

//       toast.error(
//         error.message
//       );
//     }
//   }


//   // =====================================================
//   // DELETE MESSAGE
//   // =====================================================

//   async function handleDelete(
//     messageId
//   ) {

//     try {

//       await deleteMessage(
//         messageId
//       );


//       setMessages(
//         (
//           previousMessages
//         ) =>

//           previousMessages.map(
//             (
//               message
//             ) =>

//               idOf(
//                 message
//               ) ===
//               String(
//                 messageId
//               )

//                 ? {

//                     ...message,

//                     deletedForEveryone:
//                       true,

//                     content:
//                       '',

//                     mediaUrl:
//                       '',

//                     reactions:
//                       [],

//                   }

//                 : message
//           )
//       );


//       loadUsers();

//     } catch (
//       error
//     ) {

//       toast.error(
//         error.message
//       );
//     }
//   }


//   // =====================================================
//   // CREATE STATUS
//   // =====================================================

//   async function handleCreateStatus(
//     event
//   ) {

//     event
//       .preventDefault();


//     if (
//       !statusText.trim() &&
//       !statusMedia
//     ) {

//       return;
//     }


//     try {

//       await createStatus(
//         statusText.trim(),
//         statusMedia
//       );


//       setStatusText(
//         ''
//       );


//       setStatusMedia(
//         null
//       );


//       await loadStatuses();


//       toast.success(
//         'Status posted'
//       );

//     } catch (
//       error
//     ) {

//       toast.error(
//         error.message
//       );
//     }
//   }


//   // =====================================================
//   // VIEW STATUS
//   // =====================================================

//   async function viewStatus(
//     status
//   ) {

//     setOpenStatus(
//       status
//     );


//     if (
//       idOf(
//         status.user
//       ) !==
//       idOf(
//         currentUser
//       )
//     ) {

//       await markStatusViewed(
//         status._id
//       );
//     }


//     loadStatuses();
//   }


//   // =====================================================
//   // REMOVE STATUS
//   // =====================================================

//   async function removeStatus(
//     statusId
//   ) {

//     try {

//       await deleteStatus(
//         statusId
//       );


//       setOpenStatus(
//         null
//       );


//       loadStatuses();

//     } catch (
//       error
//     ) {

//       toast.error(
//         error.message
//       );
//     }
//   }


//   // =====================================================
//   // SAVE PROFILE
//   // =====================================================

//   async function saveProfile(
//     event
//   ) {

//     event
//       .preventDefault();


//     const form =
//       new FormData();


//     form.append(
//       'username',
//       profileName.trim()
//     );


//     form.append(
//       'about',
//       profileAbout.trim()
//     );


//     if (
//       profilePhoto
//     ) {

//       form.append(
//         'profilepicture',
//         profilePhoto
//       );
//     }


//     try {

//       const result =
//         await updateUserProfile(
//           form
//         );


//       setCurrentUser(
//         result.data
//       );


//       setProfileOpen(
//         false
//       );


//       setProfilePhoto(
//         null
//       );


//       toast.success(
//         'Profile updated'
//       );

//     } catch (
//       error
//     ) {

//       toast.error(
//         error.message
//       );
//     }
//   }


//   // =====================================================
//   // LOGOUT
//   // =====================================================

//   async function handleLogout() {

//     if (
//       activeCallPeerRef.current
//     ) {

//       cleanupVideoCall(
//         true
//       );
//     }


//     try {

//       await logoutUser();

//     } catch (_) {}


//     disconnectSocket();


//     clearUser();


//     window.location.href =
//       '/user-login';
//   }


//   // =====================================================
//   // FILTER USERS
//   // =====================================================

//   const filteredUsers =
//     useMemo(
//       () => {

//         const query =
//           search
//             .toLowerCase()
//             .trim();


//         return users.filter(
//           (
//             user
//           ) => {

//             if (
//               !query
//             ) {

//               return true;
//             }


//             const value =
//               `${
//                 user.username ||
//                 ''
//               } ${
//                 user.fullPhoneNumber ||
//                 ''
//               } ${
//                 user.about ||
//                 ''
//               }`
//                 .toLowerCase();


//             return value.includes(
//               query
//             );
//           }
//         );

//       },
//       [
//         users,
//         search,
//       ]
//     );


//   // =====================================================
//   // GROUP STATUS
//   // =====================================================

//   const groupedStatuses =
//     useMemo(
//       () => {

//         const map =
//           new Map();


//         statuses.forEach(
//           (
//             status
//           ) => {

//             const key =
//               idOf(
//                 status.user
//               );


//             if (
//               !map.has(
//                 key
//               )
//             ) {

//               map.set(
//                 key,
//                 {

//                   user:
//                     status.user,

//                   items:
//                     [],

//                 }
//               );
//             }


//             map
//               .get(
//                 key
//               )
//               .items
//               .push(
//                 status
//               );
//           }
//         );


//         return [
//           ...map.values(),
//         ];

//       },
//       [
//         statuses,
//       ]
//     );


//   // =====================================================
//   // UI
//   // =====================================================

//   return (

//     <div
//       className={`whatsapp-shell ${
//         theme ===
//         'dark'
//           ? 'dark'
//           : ''
//       }`}
//     >


//       {/* LEFT ICON RAIL */}

//       <aside
//         className="icon-rail"
//       >

//         <button
//           className="profile-icon"
//           onClick={() =>
//             setProfileOpen(
//               true
//             )
//           }
//           title="Profile"
//         >

//           <img
//             src={avatarOf(
//               currentUser
//             )}
//             alt="Me"
//           />

//         </button>


//         <button
//           className={
//             activeTab ===
//             'chats'
//               ? 'rail-active'
//               : ''
//           }
//           onClick={() =>
//             setActiveTab(
//               'chats'
//             )
//           }
//           title="Chats"
//         >

//           💬

//         </button>


//         <button
//           className={
//             activeTab ===
//             'status'
//               ? 'rail-active'
//               : ''
//           }
//           onClick={() =>
//             setActiveTab(
//               'status'
//             )
//           }
//           title="Status"
//         >

//           ◉

//         </button>


//         <div
//           className="rail-spacer"
//         />


//         <button
//           onClick={
//             toggleTheme
//           }
//           title="Theme"
//         >

//           {theme ===
//           'dark'
//             ? '☀'
//             : '☾'}

//         </button>


//         <button
//           onClick={
//             handleLogout
//           }
//           title="Logout"
//         >

//           ↪

//         </button>

//       </aside>


//       {/* SIDEBAR */}

//       <section
//         className={`sidebar-panel ${
//           selectedUser
//             ? 'mobile-hidden'
//             : ''
//         }`}
//       >

//         {activeTab ===
//         'chats' ? (

//           <>

//             <div
//               className="sidebar-header"
//             >

//               <h2>
//                 Chats
//               </h2>


//               <button
//                 className="round-button"
//                 onClick={
//                   loadUsers
//                 }
//               >

//                 ↻

//               </button>

//             </div>


//             <div
//               className="search-box"
//             >

//               ⌕


//               <input
//                 value={
//                   search
//                 }
//                 onChange={(
//                   event
//                 ) =>
//                   setSearch(
//                     event.target.value
//                   )
//                 }
//                 placeholder="Search or start new chat"
//               />

//             </div>


//             <div
//               className="contact-list"
//             >

//               {filteredUsers.length ===
//                 0 && (

//                 <div
//                   className="empty-small"
//                 >

//                   No other verified users yet.

//                 </div>

//               )}


//               {filteredUsers.map(
//                 (
//                   user
//                 ) => (

//                   <div
//                     className="contact-row-wrapper"
//                     key={
//                       user._id
//                     }
//                   >

//                     <button
//                       type="button"
//                       className={`contact-row ${
//                         idOf(
//                           selectedUser
//                         ) ===
//                         idOf(
//                           user
//                         )
//                           ? 'selected'
//                           : ''
//                       }`}
//                       onClick={() =>
//                         selectUser(
//                           user
//                         )
//                       }
//                     >

//                       <div
//                         className="avatar-wrap"
//                       >

//                         <img
//                           src={avatarOf(
//                             user
//                           )}
//                           alt=""
//                         />


//                         {user.isOnline && (

//                           <span
//                             className="online-dot"
//                           />

//                         )}

//                       </div>


//                       <div
//                         className="contact-main"
//                       >

//                         <div
//                           className="contact-top"
//                         >

//                           <strong>

//                             {user.username ||
//                               user.fullPhoneNumber ||
//                               'WhatsApp user'}

//                           </strong>


//                           <span>

//                             {formatTime(
//                               user
//                                 .conversation
//                                 ?.lastMessage
//                                 ?.createdAt ||
//                               user
//                                 .conversation
//                                 ?.updatedAt
//                             )}

//                           </span>

//                         </div>


//                         <div
//                           className="contact-bottom"
//                         >

//                           <span>

//                             {messagePreview(
//                               user
//                             )}

//                           </span>


//                           {user.unreadCount >
//                             0 && (

//                             <b>

//                               {
//                                 user.unreadCount
//                               }

//                             </b>

//                           )}

//                         </div>

//                       </div>

//                     </button>


//                     {/* REMOVE USER */}

//                     <button
//                       type="button"
//                       className="contact-delete-button"
//                       title="Remove from chat list"
//                       aria-label="Remove from chat list"
//                       onClick={(
//                         event
//                       ) =>
//                         handleRemoveUser(
//                           user,
//                           event
//                         )
//                       }
//                     >

//                       <svg
//                         viewBox="0 0 24 24"
//                         aria-hidden="true"
//                       >

//                         <path
//                           d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-2 6h10l-.7 11H7.7L7 9Zm3 2v7h2v-7h-2Zm4 0v7h2v-7h-2Z"
//                           fill="currentColor"
//                         />

//                       </svg>

//                     </button>

//                   </div>

//                 )
//               )}

//             </div>

//           </>

//         ) : (

//           <>

//             <div
//               className="sidebar-header"
//             >

//               <h2>
//                 Status
//               </h2>


//               <button
//                 className="round-button"
//                 onClick={
//                   loadStatuses
//                 }
//               >

//                 ↻

//               </button>

//             </div>


//             <form
//               className="status-create"
//               onSubmit={
//                 handleCreateStatus
//               }
//             >

//               <div
//                 className="status-me"
//               >

//                 <img
//                   src={avatarOf(
//                     currentUser
//                   )}
//                   alt="Me"
//                 />


//                 <div>

//                   <strong>
//                     My status
//                   </strong>

//                   <small>
//                     Post text, photo or video
//                   </small>

//                 </div>

//               </div>


//               <textarea
//                 value={
//                   statusText
//                 }
//                 onChange={(
//                   event
//                 ) =>
//                   setStatusText(
//                     event.target.value
//                   )
//                 }
//                 placeholder="What's happening?"
//                 rows={3}
//               />


//               <div
//                 className="status-actions"
//               >

//                 <label
//                   className="attach-label"
//                 >

//                   ＋ Media


//                   <input
//                     type="file"
//                     accept="image/*,video/*"
//                     hidden
//                     onChange={(
//                       event
//                     ) =>
//                       setStatusMedia(
//                         event.target.files?.[0] ||
//                         null
//                       )
//                     }
//                   />

//                 </label>


//                 <button
//                   className="primary-mini"
//                 >

//                   Post

//                 </button>

//               </div>


//               {statusMedia && (

//                 <small
//                   className="file-chip"
//                 >

//                   {
//                     statusMedia.name
//                   }

//                 </small>

//               )}

//             </form>


//             <div
//               className="status-list"
//             >

//               {groupedStatuses.map(
//                 (
//                   group
//                 ) => (

//                   <button
//                     className="status-row"
//                     key={
//                       idOf(
//                         group.user
//                       )
//                     }
//                     onClick={() =>
//                       viewStatus(
//                         group.items[0]
//                       )
//                     }
//                   >

//                     <div
//                       className="status-ring"
//                     >

//                       <img
//                         src={avatarOf(
//                           group.user
//                         )}
//                         alt=""
//                       />

//                     </div>


//                     <div>

//                       <strong>

//                         {idOf(
//                           group.user
//                         ) ===
//                         idOf(
//                           currentUser
//                         )

//                           ? 'My status'

//                           : group.user
//                               ?.username ||
//                             'User'}

//                       </strong>


//                       <small>

//                         {
//                           group.items.length
//                         }{' '}

//                         update

//                         {group.items.length >
//                         1
//                           ? 's'
//                           : ''}

//                         {' '}·{' '}

//                         {formatTime(
//                           group.items[0]
//                             .createdAt
//                         )}

//                       </small>

//                     </div>

//                   </button>

//                 )
//               )}


//               {!groupedStatuses.length && (

//                 <div
//                   className="empty-small"
//                 >

//                   No active status updates.

//                 </div>

//               )}

//             </div>

//           </>

//         )}

//       </section>


//       {/* CHAT PANEL */}

//       <main
//         className={`chat-panel ${
//           selectedUser
//             ? 'mobile-visible'
//             : ''
//         }`}
//       >

//         {selectedUser &&
//         activeTab ===
//           'chats' ? (

//           <>

//             <header
//               className="chat-header"
//             >

//               <button
//                 className="mobile-back"
//                 onClick={() =>
//                   setSelectedUser(
//                     null
//                   )
//                 }
//               >

//                 ←

//               </button>


//               <img
//                 src={avatarOf(
//                   selectedUser
//                 )}
//                 alt=""
//               />


//               <div>

//                 <strong>

//                   {selectedUser.username ||
//                     selectedUser.fullPhoneNumber}

//                 </strong>


//                 <small>

//                   {typing
//                     ? 'typing…'
//                     : lastSeenText(
//                         selectedUser
//                       )}

//                 </small>

//               </div>


//               <div
//                 className="chat-header-actions"
//               >


//                 {/* VIDEO CALL */}

//                 <button
//                   type="button"
//                   className="video-call-button"
//                   title="Video call"
//                   aria-label="Video call"
//                   onClick={
//                     startVideoCall
//                   }
//                   disabled={
//                     callState !==
//                     'idle'
//                   }
//                 >

//                   <svg
//                     viewBox="0 0 24 24"
//                     aria-hidden="true"
//                   >

//                     <path
//                       fill="currentColor"
//                       d="M4 5h11a2 2 0 0 1 2 2v2.5l4-2.5v10l-4-2.5V17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v10h11V7H4Z"
//                     />

//                   </svg>

//                 </button>


//                 <button
//                   type="button"
//                   title="Search"
//                 >

//                   ⌕

//                 </button>


//                 <button
//                   type="button"
//                   title="More"
//                 >

//                   ⋮

//                 </button>

//               </div>

//             </header>


//             {/* MESSAGES */}

//             <div
//               className="messages-area"
//             >

//               <div
//                 className="encryption-note"
//               >

//                 🔒 Messages in this demo are delivered through your own backend and database.

//               </div>


//               {messages.map(
//                 (
//                   message
//                 ) => {

//                   const mine =
//                     idOf(
//                       message.sender
//                     ) ===
//                     idOf(
//                       currentUser
//                     );


//                   const reactions =
//                     message.reactions ||
//                     [];


//                   return (

//                     <div
//                       className={`message-line ${
//                         mine
//                           ? 'mine'
//                           : 'theirs'
//                       }`}
//                       key={
//                         message._id
//                       }
//                     >

//                       <div
//                         className={`message-bubble ${
//                           message
//                             .deletedForEveryone
//                             ? 'deleted'
//                             : ''
//                         }`}
//                       >

//                         {message
//                           .deletedForEveryone ? (

//                           <em>

//                             🚫 This message was deleted

//                           </em>

//                         ) : (

//                           <>

//                             {message
//                               .contentType ===
//                               'image' &&
//                               message
//                                 .mediaUrl && (

//                                 <img
//                                   className="message-media"
//                                   src={
//                                     message.mediaUrl
//                                   }
//                                   alt="Shared"
//                                 />

//                               )}


//                             {message
//                               .contentType ===
//                               'video' &&
//                               message
//                                 .mediaUrl && (

//                                 <video
//                                   className="message-media"
//                                   src={
//                                     message.mediaUrl
//                                   }
//                                   controls
//                                 />

//                               )}


//                             {message
//                               .content && (

//                               <div
//                                 className="message-text"
//                               >

//                                 {
//                                   message.content
//                                 }

//                               </div>

//                             )}

//                           </>

//                         )}


//                         <div
//                           className="message-meta"
//                         >

//                           <span>

//                             {formatTime(
//                               message.createdAt
//                             )}

//                           </span>


//                           {mine && (

//                             <span
//                               className={
//                                 message
//                                   .messageStatus ===
//                                 'read'

//                                   ? 'status-read'

//                                   : ''
//                               }
//                             >

//                               {message
//                                 .messageStatus ===
//                               'sent'
//                                 ? '✓'
//                                 : '✓✓'}

//                             </span>

//                           )}

//                         </div>


//                         {!message
//                           .deletedForEveryone && (

//                           <div
//                             className="message-tools"
//                           >

//                             {[
//                               '👍',
//                               '❤️',
//                               '😂',
//                             ].map(
//                               (
//                                 emoji
//                               ) => (

//                                 <button
//                                   key={
//                                     emoji
//                                   }
//                                   onClick={() =>
//                                     handleReaction(
//                                       message._id,
//                                       emoji
//                                     )
//                                   }
//                                 >

//                                   {
//                                     emoji
//                                   }

//                                 </button>

//                               )
//                             )}


//                             {mine && (

//                               <button
//                                 onClick={() =>
//                                   handleDelete(
//                                     message._id
//                                   )
//                                 }
//                               >

//                                 🗑

//                               </button>

//                             )}

//                           </div>

//                         )}


//                         {reactions.length >
//                           0 && (

//                           <div
//                             className="reaction-pill"
//                           >

//                             {reactions.map(
//                               (
//                                 reaction,
//                                 index
//                               ) => (

//                                 <span
//                                   key={`${idOf(
//                                     reaction.user
//                                   )}-${index}`}
//                                 >

//                                   {
//                                     reaction.emoji
//                                   }

//                                 </span>

//                               )
//                             )}

//                           </div>

//                         )}

//                       </div>

//                     </div>

//                   );
//                 }
//               )}


//               {typing && (

//                 <div
//                   className="typing-bubble"
//                 >

//                   <span />
//                   <span />
//                   <span />

//                 </div>

//               )}


//               <div
//                 ref={
//                   messagesEndRef
//                 }
//               />

//             </div>


//             {/* MEDIA PREVIEW */}

//             {media && (

//               <div
//                 className="media-preview-bar"
//               >

//                 <span>

//                   Attachment: {
//                     media.name
//                   }

//                 </span>


//                 <button
//                   type="button"
//                   onClick={() =>
//                     setMedia(
//                       null
//                     )
//                   }
//                 >

//                   ×

//                 </button>

//               </div>

//             )}


//             {/* COMPOSER */}

//             <form
//               className="composer"
//               onSubmit={
//                 handleSend
//               }
//             >

//               <label
//                 className="composer-icon"
//                 title="Attach photo/video"
//               >

//                 ＋


//                 <input
//                   ref={
//                     fileRef
//                   }
//                   type="file"
//                   accept="image/*,video/*"
//                   hidden
//                   onChange={(
//                     event
//                   ) =>
//                     setMedia(
//                       event
//                         .target
//                         .files?.[0] ||
//                         null
//                     )
//                   }
//                 />

//               </label>


//               <input
//                 value={
//                   text
//                 }
//                 onChange={(
//                   event
//                 ) =>
//                   onTypingChange(
//                     event.target.value
//                   )
//                 }
//                 placeholder="Type a message"
//               />


//               <button
//                 className="send-button"
//                 disabled={
//                   sending ||
//                   (
//                     !text.trim() &&
//                     !media
//                   )
//                 }
//               >

//                 {sending
//                   ? '…'
//                   : '➤'}

//               </button>

//             </form>

//           </>

//         ) : (

//           <div
//             className="welcome-pane"
//           >

//             <div
//               className="welcome-graphic"
//             >

//               💬

//             </div>


//             <h1>

//               WhatsApp Clone

//             </h1>


//             <p>

//               Send and receive messages without keeping your phone connected. Choose a contact to begin.

//             </p>


//             <small>

//               🔒 Built as a full-stack learning project.

//             </small>

//           </div>

//         )}

//       </main>


//       {/* =================================================
//           STATUS MODAL
//           ================================================= */}

//       {openStatus && (

//         <div
//           className="modal-backdrop"
//           onClick={() =>
//             setOpenStatus(
//               null
//             )
//           }
//         >

//           <div
//             className="status-viewer"
//             onClick={(
//               event
//             ) =>
//               event
//                 .stopPropagation()
//             }
//           >

//             <div
//               className="status-viewer-head"
//             >

//               <div>

//                 <img
//                   src={avatarOf(
//                     openStatus.user
//                   )}
//                   alt=""
//                 />


//                 <span>

//                   <strong>

//                     {openStatus
//                       .user
//                       ?.username ||
//                       'Status'}

//                   </strong>


//                   <small>

//                     {formatTime(
//                       openStatus.createdAt
//                     )}

//                   </small>

//                 </span>

//               </div>


//               <button
//                 type="button"
//                 onClick={() =>
//                   setOpenStatus(
//                     null
//                   )
//                 }
//               >

//                 ×

//               </button>

//             </div>


//             <div
//               className="status-content"
//             >

//               {openStatus.contentType ===
//                 'image' && (

//                 <img
//                   src={
//                     openStatus.mediaUrl
//                   }
//                   alt="Status"
//                 />

//               )}


//               {openStatus.contentType ===
//                 'video' && (

//                 <video
//                   src={
//                     openStatus.mediaUrl
//                   }
//                   controls
//                   autoPlay
//                 />

//               )}


//               {openStatus.content && (

//                 <p>

//                   {
//                     openStatus.content
//                   }

//                 </p>

//               )}

//             </div>


//             {idOf(
//               openStatus.user
//             ) ===
//               idOf(
//                 currentUser
//               ) && (

//               <div
//                 className="status-footer"
//               >

//                 <span>

//                   👁 {
//                     openStatus
//                       .viewers
//                       ?.length ||
//                     0
//                   } views

//                 </span>


//                 <button
//                   type="button"
//                   onClick={() =>
//                     removeStatus(
//                       openStatus._id
//                     )
//                   }
//                 >

//                   Delete status

//                 </button>

//               </div>

//             )}

//           </div>

//         </div>

//       )}


//       {/* =================================================
//           PROFILE MODAL
//           ================================================= */}

//       {profileOpen && (

//         <div
//           className="modal-backdrop"
//           onClick={() =>
//             setProfileOpen(
//               false
//             )
//           }
//         >

//           <form
//             className="profile-modal"
//             onSubmit={
//               saveProfile
//             }
//             onClick={(
//               event
//             ) =>
//               event
//                 .stopPropagation()
//             }
//           >

//             <div
//               className="modal-title"
//             >

//               <h3>
//                 Profile
//               </h3>


//               <button
//                 type="button"
//                 onClick={() =>
//                   setProfileOpen(
//                     false
//                   )
//                 }
//               >

//                 ×

//               </button>

//             </div>


//             <img
//               className="profile-large"
//               src={
//                 profilePhoto
//                   ? URL
//                       .createObjectURL(
//                         profilePhoto
//                       )
//                   : avatarOf(
//                       currentUser
//                     )
//               }
//               alt="Profile"
//             />


//             <label
//               className="attach-label profile-photo-label"
//             >

//               Change photo


//               <input
//                 type="file"
//                 accept="image/*"
//                 hidden
//                 onChange={(
//                   event
//                 ) =>
//                   setProfilePhoto(
//                     event.target.files?.[0] ||
//                     null
//                   )
//                 }
//               />

//             </label>


//             <label>

//               Name


//               <input
//                 value={
//                   profileName
//                 }
//                 onChange={(
//                   event
//                 ) =>
//                   setProfileName(
//                     event.target.value
//                   )
//                 }
//                 maxLength={
//                   40
//                 }
//               />

//             </label>


//             <label>

//               About


//               <textarea
//                 value={
//                   profileAbout
//                 }
//                 onChange={(
//                   event
//                 ) =>
//                   setProfileAbout(
//                     event.target.value
//                   )
//                 }
//                 maxLength={
//                   140
//                 }
//                 rows={
//                   3
//                 }
//               />

//             </label>


//             <button
//               className="primary-btn"
//             >

//               Save profile

//             </button>

//           </form>

//         </div>

//       )}


//       {/* =================================================
//           VIDEO CALL WINDOW
//           ================================================= */}

//       {callState !==
//         'idle' && (

//         <div
//           className="video-call-overlay"
//         >

//           <div
//             className="video-call-window"
//           >


//             {/* INCOMING CALL */}

//             {callState ===
//             'incoming' ? (

//               <div
//                 className="incoming-call-box"
//               >

//                 <img
//                   className="incoming-call-avatar"
//                   src={avatarOf(
//                     activeCallUser
//                   )}
//                   alt=""
//                 />


//                 <h2>

//                   {activeCallUser
//                     ?.username ||
//                     activeCallUser
//                       ?.fullPhoneNumber ||
//                     'User'}

//                 </h2>


//                 <p>

//                   Incoming video call...

//                 </p>


//                 <div
//                   className="incoming-call-actions"
//                 >

//                   {/* REJECT */}

//                   <button
//                     type="button"
//                     className="call-reject-button"
//                     title="Reject"
//                     onClick={
//                       rejectVideoCall
//                     }
//                   >

//                     ✕

//                   </button>


//                   {/* ACCEPT */}

//                   <button
//                     type="button"
//                     className="call-accept-button"
//                     title="Accept video call"
//                     onClick={
//                       acceptVideoCall
//                     }
//                   >

//                     <svg
//                       viewBox="0 0 24 24"
//                       aria-hidden="true"
//                     >

//                       <path
//                         fill="currentColor"
//                         d="M4 5h11a2 2 0 0 1 2 2v2.5l4-2.5v10l-4-2.5V17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v10h11V7H4Z"
//                       />

//                     </svg>

//                   </button>

//                 </div>

//               </div>

//             ) : (

//               <>


//                 {/* VIDEO CALL HEADER */}

//                 <div
//                   className="video-call-header"
//                 >

//                   <div>

//                     <strong>

//                       {activeCallUser
//                         ?.username ||
//                         activeCallUser
//                           ?.fullPhoneNumber ||
//                         'Video call'}

//                     </strong>


//                     <small>

//                       {callState ===
//                       'calling'

//                         ? 'Calling...'

//                         : callState ===
//                           'connecting'

//                           ? 'Connecting...'

//                           : 'Connected'}

//                     </small>

//                   </div>

//                 </div>


//                 {/* VIDEOS */}

//                 <div
//                   className="remote-video-container"
//                 >


//                   {/* REMOTE VIDEO */}

//                   <video
//                     ref={
//                       remoteVideoRef
//                     }
//                     className="remote-video"
//                     autoPlay
//                     playsInline
//                   />


//                   {(callState ===
//                     'calling' ||
//                     callState ===
//                     'connecting') && (

//                     <div
//                       className="calling-message"
//                     >

//                       {callState ===
//                       'calling'
//                         ? 'Calling...'
//                         : 'Connecting...'}

//                     </div>

//                   )}


//                   {/* MY VIDEO */}

//                   <video
//                     ref={
//                       localVideoRef
//                     }
//                     className="local-video"
//                     autoPlay
//                     playsInline
//                     muted
//                   />

//                 </div>


//                 {/* END CALL */}

//                 <div
//                   className="video-call-controls"
//                 >

//                   <button
//                     type="button"
//                     className="call-end-button"
//                     onClick={
//                       endVideoCall
//                     }
//                   >

//                     ✕ End Call

//                   </button>

//                 </div>

//               </>

//             )}

//           </div>

//         </div>

//       )}

//     </div>
//   );
// }

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import useUserStore from '../../store/useUserStore';
import useThemeStore from '../../store/useThemeStore';

import {
  getAllUser,
  logoutUser,
  updateUserProfile,
  removeUserFromList,
} from '../../api/authApi';

import {
  deleteMessage,
  getMessages,
  reactToMessage,
  sendMessage,
} from '../../api/chatApi';

import {
  createStatus,
  deleteStatus,
  getStatuses,
  markStatusViewed,
} from '../../api/statusApi';

import {
  disconnectSocket,
  getSocket,
} from '../../utils/socket';


const fallbackAvatar = (user) =>
  `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(
    user?.username || user?._id || 'user'
  )}`;


const avatarOf = (user) =>
  user?.profilepicture ||
  user?.profilePicture ||
  fallbackAvatar(user);


const idOf = (value) =>
  String(value?._id || value || '');


const rtcConfiguration = {
  iceServers: [
    {
      urls:
        'stun:stun.l.google.com:19302',
    },
    {
      urls:
        'stun:stun1.l.google.com:19302',
    },
  ],
};


function formatTime(value) {
  if (!value) return '';

  const date = new Date(value);
  const now = new Date();

  if (
    date.toDateString() ===
    now.toDateString()
  ) {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return date.toLocaleDateString([], {
    day: '2-digit',
    month: 'short',
  });
}


function lastSeenText(user) {
  if (user?.isOnline) {
    return 'online';
  }

  if (!user?.lastSeen) {
    return 'offline';
  }

  return `last seen ${new Date(
    user.lastSeen
  ).toLocaleString([], {
    dateStyle: 'short',
    timeStyle: 'short',
  })}`;
}


function messagePreview(item) {
  const message =
    item?.conversation?.lastMessage;

  if (!message) {
    return (
      item?.about ||
      'Start a conversation'
    );
  }

  if (message.deletedForEveryone) {
    return 'Message deleted';
  }

  if (message.contentType === 'image') {
    return '📷 Photo';
  }

  if (message.contentType === 'video') {
    return '🎥 Video';
  }

  return message.content || 'Message';
}


export default function Home() {

  const currentUser =
    useUserStore(
      (state) => state.user
    );

  const setCurrentUser =
    useUserStore(
      (state) => state.setUser
    );

  const clearUser =
    useUserStore(
      (state) => state.clearUser
    );


  const {
    theme,
    toggleTheme,
  } = useThemeStore();


  const [
    activeTab,
    setActiveTab,
  ] = useState('chats');


  const [
    users,
    setUsers,
  ] = useState([]);


  const usersRef =
    useRef([]);


  const [
    selectedUser,
    setSelectedUser,
  ] = useState(null);


  const selectedUserRef =
    useRef(null);


  const [
    conversationId,
    setConversationId,
  ] = useState(null);


  const [
    messages,
    setMessages,
  ] = useState([]);


  const [
    search,
    setSearch,
  ] = useState('');


  const [
    text,
    setText,
  ] = useState('');


  const [
    media,
    setMedia,
  ] = useState(null);


  const [
    sending,
    setSending,
  ] = useState(false);


  const [
    typing,
    setTyping,
  ] = useState(false);


  const [
    statuses,
    setStatuses,
  ] = useState([]);


  const [
    statusText,
    setStatusText,
  ] = useState('');


  const [
    statusMedia,
    setStatusMedia,
  ] = useState(null);


  const [
    openStatus,
    setOpenStatus,
  ] = useState(null);


  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);


  const [
    profileName,
    setProfileName,
  ] = useState(
    currentUser?.username || ''
  );


  const [
    profileAbout,
    setProfileAbout,
  ] = useState(
    currentUser?.about || ''
  );


  const [
    profilePhoto,
    setProfilePhoto,
  ] = useState(null);


  const messagesEndRef =
    useRef(null);

  const fileRef =
    useRef(null);

  const typingTimer =
    useRef(null);

  const socketRef =
    useRef(null);


  // =====================================================
  // VIDEO CALL REFS
  // =====================================================

  const localVideoRef =
    useRef(null);

  const remoteVideoRef =
    useRef(null);

  const peerConnectionRef =
    useRef(null);

  const localStreamRef =
    useRef(null);

  const remoteStreamRef =
    useRef(null);

  const activeCallPeerRef =
    useRef(null);

  const pendingIceCandidatesRef =
    useRef([]);

  const mediaRequestRef =
    useRef(null);

  const acceptingCallRef =
    useRef(false);


  // =====================================================
  // VIDEO CALL STATE
  // =====================================================

  const [
    callState,
    setCallState,
  ] = useState('idle');


  const [
    incomingCall,
    setIncomingCall,
  ] = useState(null);


  const [
    activeCallUser,
    setActiveCallUser,
  ] = useState(null);


  // =====================================================
  // KEEP REFS UPDATED
  // =====================================================

  useEffect(() => {

    selectedUserRef.current =
      selectedUser;

  }, [
    selectedUser,
  ]);


  useEffect(() => {

    usersRef.current =
      users;

  }, [
    users,
  ]);


  // =====================================================
  // LOAD USERS
  // =====================================================

  const loadUsers =
    async () => {

      try {

        const result =
          await getAllUser();


        const list =
          result?.data || [];


        setUsers(
          list
        );


        const selectedId =
          idOf(
            selectedUserRef.current
          );


        if (selectedId) {

          const fresh =
            list.find(
              (user) =>
                idOf(user) ===
                selectedId
            );


          if (fresh) {

            setSelectedUser(
              fresh
            );


            selectedUserRef.current =
              fresh;
          }
        }

      } catch (error) {

        toast.error(
          error.message
        );
      }
    };


  // =====================================================
  // LOAD STATUS
  // =====================================================

  const loadStatuses =
    async () => {

      try {

        setStatuses(
          await getStatuses()
        );

      } catch (error) {

        toast.error(
          error.message
        );
      }
    };


  useEffect(() => {

    loadUsers();

    loadStatuses();


    const userInterval =
      setInterval(
        loadUsers,
        15000
      );


    return () =>
      clearInterval(
        userInterval
      );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // =====================================================
  // CLEAN VIDEO CALL
  // =====================================================

  function cleanupVideoCall(
    notifyOtherUser = false
  ) {

    acceptingCallRef.current =
      false;


    mediaRequestRef.current =
      null;


    const peerId =
      activeCallPeerRef.current ||
      incomingCall?.from;


    if (
      notifyOtherUser &&
      peerId
    ) {

      socketRef.current?.emit(
        'video_call_end',
        {
          to:
            String(peerId),
        }
      );
    }


    if (
      peerConnectionRef.current
    ) {

      peerConnectionRef.current
        .onicecandidate =
        null;


      peerConnectionRef.current
        .ontrack =
        null;


      peerConnectionRef.current
        .onconnectionstatechange =
        null;


      peerConnectionRef.current
        .oniceconnectionstatechange =
        null;


      try {

        peerConnectionRef.current
          .close();

      } catch (_) {}


      peerConnectionRef.current =
        null;
    }


    if (
      localStreamRef.current
    ) {

      localStreamRef.current
        .getTracks()
        .forEach(
          (track) => {

            track.stop();

          }
        );


      localStreamRef.current =
        null;
    }


    remoteStreamRef.current =
      null;


    if (
      localVideoRef.current
    ) {

      localVideoRef.current.srcObject =
        null;
    }


    if (
      remoteVideoRef.current
    ) {

      remoteVideoRef.current.srcObject =
        null;
    }


    pendingIceCandidatesRef.current =
      [];


    activeCallPeerRef.current =
      null;


    setIncomingCall(
      null
    );


    setActiveCallUser(
      null
    );


    setCallState(
      'idle'
    );
  }


  // =====================================================
  // OPEN CAMERA + MICROPHONE
  // FIXES NotReadableError: Device in use
  // =====================================================

  async function openLocalMedia() {

    // Reuse existing live stream
    if (
      localStreamRef.current &&
      localStreamRef.current
        .getTracks()
        .some(
          (track) =>
            track.readyState ===
            'live'
        )
    ) {

      return localStreamRef.current;
    }


    // Prevent duplicate camera requests
    if (
      mediaRequestRef.current
    ) {

      return mediaRequestRef.current;
    }


    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {

      throw new Error(
        'Camera and microphone are not available. Use HTTPS and allow browser permissions.'
      );
    }


    mediaRequestRef.current =
      navigator.mediaDevices
        .getUserMedia({

          video: {
            facingMode:
              'user',
          },

          audio:
            true,

        })

        .then(
          (stream) => {

            localStreamRef.current =
              stream;


            if (
              localVideoRef.current
            ) {

              localVideoRef.current.srcObject =
                stream;
            }


            return stream;
          }
        )

        .catch(
          async (
            error
          ) => {

            console.error(
              'Camera/microphone error:',
              error
            );


            // =============================================
            // DEVICE ALREADY IN USE
            // Try microphone only
            // =============================================

            if (
              error?.name ===
              'NotReadableError'
            ) {

              try {

                const audioOnlyStream =
                  await navigator
                    .mediaDevices
                    .getUserMedia({

                      video:
                        false,

                      audio:
                        true,

                    });


                localStreamRef.current =
                  audioOnlyStream;


                toast.info(
                  'Camera is busy. Call will use microphone only.'
                );


                return audioOnlyStream;

              } catch (
                audioError
              ) {

                console.error(
                  'Audio-only fallback failed:',
                  audioError
                );


                const deviceError =
                  new Error(
                    'Camera or microphone is already being used by another app or browser tab.'
                  );


                deviceError.name =
                  'NotReadableError';


                throw deviceError;
              }
            }


            // =============================================
            // PERMISSION DENIED
            // =============================================

            if (
              error?.name ===
              'NotAllowedError'
            ) {

              const permissionError =
                new Error(
                  'Camera or microphone permission was denied. Allow camera and microphone in the browser.'
                );


              permissionError.name =
                'NotAllowedError';


              throw permissionError;
            }


            // =============================================
            // NO CAMERA / MICROPHONE
            // =============================================

            if (
              error?.name ===
              'NotFoundError'
            ) {

              const notFoundError =
                new Error(
                  'No camera or microphone was found on this device.'
                );


              notFoundError.name =
                'NotFoundError';


              throw notFoundError;
            }


            throw error;
          }
        )

        .finally(
          () => {

            mediaRequestRef.current =
              null;
          }
        );


    return mediaRequestRef.current;
  }


  // =====================================================
  // CREATE WEBRTC CONNECTION
  // =====================================================

  function createPeerConnection(
    peerUserId
  ) {

    if (
      peerConnectionRef.current
    ) {

      try {

        peerConnectionRef.current
          .close();

      } catch (_) {}
    }


    const peer =
      new RTCPeerConnection(
        rtcConfiguration
      );


    peerConnectionRef.current =
      peer;


    // Send ICE to other user
    peer.onicecandidate =
      (
        event
      ) => {

        if (
          !event.candidate
        ) {
          return;
        }


        socketRef.current?.emit(
          'video_call_ice',
          {

            to:
              String(
                peerUserId
              ),

            candidate:
              event.candidate,

          }
        );
      };


    // Receive other user video/audio
    peer.ontrack =
      (
        event
      ) => {

        let stream =
          event.streams?.[0];


        if (!stream) {

          if (
            !remoteStreamRef.current
          ) {

            remoteStreamRef.current =
              new MediaStream();
          }


          const exists =
            remoteStreamRef.current
              .getTracks()
              .some(
                (track) =>
                  track.id ===
                  event.track.id
              );


          if (!exists) {

            remoteStreamRef.current
              .addTrack(
                event.track
              );
          }


          stream =
            remoteStreamRef.current;

        } else {

          remoteStreamRef.current =
            stream;
        }


        if (
          remoteVideoRef.current
        ) {

          remoteVideoRef.current.srcObject =
            stream;


          remoteVideoRef.current
            .play?.()
            .catch(
              () => {}
            );
        }
      };


    peer.onconnectionstatechange =
      () => {

        if (
          peer.connectionState ===
          'connected'
        ) {

          setCallState(
            'connected'
          );
        }


        if (
          peer.connectionState ===
          'failed'
        ) {

          cleanupVideoCall(
            false
          );


          toast.error(
            'Video call connection failed'
          );
        }
      };


    peer.oniceconnectionstatechange =
      () => {

        if (
          peer.iceConnectionState ===
          'failed'
        ) {

          console.error(
            'ICE connection failed'
          );
        }
      };


    return peer;
  }


  // =====================================================
  // ADD ICE CANDIDATES RECEIVED BEFORE ANSWER
  // =====================================================

  async function flushIceCandidates() {

    const peer =
      peerConnectionRef.current;


    if (
      !peer ||
      !peer.remoteDescription
    ) {

      return;
    }


    const candidates =
      pendingIceCandidatesRef.current;


    pendingIceCandidatesRef.current =
      [];


    for (
      const candidate
      of candidates
    ) {

      try {

        await peer
          .addIceCandidate(
            candidate
          );

      } catch (error) {

        console.error(
          'ICE candidate error:',
          error
        );
      }
    }
  }


  // =====================================================
  // START VIDEO CALL
  // =====================================================

  async function startVideoCall() {

    if (
      !selectedUser ||
      callState !==
        'idle'
    ) {

      return;
    }


    try {

      const socket =
        socketRef.current ||
        await getSocket();


      socketRef.current =
        socket;


      socket.emit(
        'user_connected',
        currentUser._id
      );


      const peerId =
        idOf(
          selectedUser
        );


      activeCallPeerRef.current =
        peerId;


      setActiveCallUser(
        selectedUser
      );


      setCallState(
        'calling'
      );


      const stream =
        await openLocalMedia();


      const peer =
        createPeerConnection(
          peerId
        );


      stream
        .getTracks()
        .forEach(
          (
            track
          ) => {

            peer.addTrack(
              track,
              stream
            );
          }
        );


      const offer =
        await peer
          .createOffer({

            offerToReceiveAudio:
              true,

            offerToReceiveVideo:
              true,

          });


      await peer
        .setLocalDescription(
          offer
        );


      socket.emit(
        'video_call_offer',
        {

          to:
            peerId,

          offer:
            peer.localDescription,

        }
      );

    } catch (error) {

      console.error(
        'Start video call:',
        error
      );


      cleanupVideoCall(
        false
      );


      toast.error(
        error?.message ||
        'Unable to start video call'
      );
    }
  }


  // =====================================================
  // ACCEPT VIDEO CALL
  // FIXES DOUBLE ACCEPT + DEVICE IN USE
  // =====================================================

  async function acceptVideoCall() {

    if (
      !incomingCall?.from ||
      !incomingCall?.offer
    ) {

      return;
    }


    // Prevent duplicate Accept
    if (
      acceptingCallRef.current
    ) {

      return;
    }


    acceptingCallRef.current =
      true;


    try {

      const {
        from,
        offer,
      } =
        incomingCall;


      activeCallPeerRef.current =
        String(
          from
        );


      setCallState(
        'connecting'
      );


      let stream =
        null;


      try {

        stream =
          await openLocalMedia();

      } catch (
        mediaError
      ) {

        console.error(
          'Local camera/microphone unavailable:',
          mediaError
        );


        /*
         * Important:
         * Do not terminate the whole WebRTC call
         * just because this user's local camera
         * is being used by another app/tab.
         *
         * The receiver can still receive the
         * caller's media.
         */

        if (
          [
            'NotReadableError',
            'NotAllowedError',
            'NotFoundError',
          ].includes(
            mediaError?.name
          )
        ) {

          toast.warning(
            `${mediaError.message} Continuing in receive-only mode.`
          );

        } else {

          throw mediaError;
        }
      }


      const peer =
        createPeerConnection(
          String(
            from
          )
        );


      // Add local tracks only if available
      if (stream) {

        stream
          .getTracks()
          .forEach(
            (
              track
            ) => {

              peer.addTrack(
                track,
                stream
              );
            }
          );
      }


      await peer
        .setRemoteDescription(
          new RTCSessionDescription(
            offer
          )
        );


      await flushIceCandidates();


      const answer =
        await peer
          .createAnswer();


      await peer
        .setLocalDescription(
          answer
        );


      socketRef.current?.emit(
        'video_call_answer',
        {

          to:
            String(
              from
            ),

          answer:
            peer.localDescription,

        }
      );


      setIncomingCall(
        null
      );

    } catch (error) {

      console.error(
        'Accept video call:',
        error
      );


      cleanupVideoCall(
        false
      );


      toast.error(
        error?.message ||
        'Unable to accept video call'
      );

    } finally {

      acceptingCallRef.current =
        false;
    }
  }


  // =====================================================
  // REJECT VIDEO CALL
  // =====================================================

  function rejectVideoCall() {

    const callerId =
      incomingCall?.from ||
      activeCallPeerRef.current;


    if (
      callerId
    ) {

      socketRef.current?.emit(
        'video_call_reject',
        {

          to:
            String(
              callerId
            ),

          reason:
            'rejected',

        }
      );
    }


    cleanupVideoCall(
      false
    );
  }


  // =====================================================
  // END VIDEO CALL
  // =====================================================

  function endVideoCall() {

    cleanupVideoCall(
      true
    );
  }


  // =====================================================
  // ATTACH VIDEO STREAMS
  // =====================================================

  useEffect(() => {

    if (
      localVideoRef.current &&
      localStreamRef.current
    ) {

      localVideoRef.current.srcObject =
        localStreamRef.current;


      localVideoRef.current
        .play?.()
        .catch(
          () => {}
        );
    }


    if (
      remoteVideoRef.current &&
      remoteStreamRef.current
    ) {

      remoteVideoRef.current.srcObject =
        remoteStreamRef.current;


      remoteVideoRef.current
        .play?.()
        .catch(
          () => {}
        );
    }

  }, [
    callState,
    incomingCall,
  ]);


  // =====================================================
  // SOCKET
  // =====================================================

  useEffect(() => {

    if (
      !currentUser?._id
    ) {

      return;
    }


    let mounted =
      true;


    let socket;


    getSocket()
      .then(
        (
          socketInstance
        ) => {

          if (
            !mounted
          ) {

            return;
          }


          socket =
            socketInstance;


          socketRef.current =
            socketInstance;


          socketInstance.emit(
            'user_connected',
            currentUser._id
          );


          // =============================================
          // MESSAGE RECEIVED
          // =============================================

          const onReceive =
            (
              message
            ) => {

              const peer =
                selectedUserRef.current;


              const peerId =
                idOf(
                  peer
                );


              const senderId =
                idOf(
                  message.sender
                );


              if (
                peerId &&
                senderId ===
                  peerId
              ) {

                setMessages(
                  (
                    previousMessages
                  ) =>

                    previousMessages.some(
                      (
                        item
                      ) =>

                        idOf(
                          item
                        ) ===
                        idOf(
                          message
                        )
                    )

                      ? previousMessages

                      : [
                          ...previousMessages,
                          message,
                        ]
                );
              }


              loadUsers();
            };


          const onUpdated =
            () => {

              loadUsers();
            };


          // =============================================
          // ONLINE STATUS
          // =============================================

          const onUserStatus =
            ({
              userId,
              isOnline,
              lastSeen,
            }) => {

              setUsers(
                (
                  previousUsers
                ) =>

                  previousUsers.map(
                    (
                      user
                    ) =>

                      idOf(
                        user
                      ) ===
                      String(
                        userId
                      )

                        ? {
                            ...user,
                            isOnline,
                            lastSeen,
                          }

                        : user
                  )
              );


              setSelectedUser(
                (
                  previousUser
                ) =>

                  previousUser &&
                  idOf(
                    previousUser
                  ) ===
                    String(
                      userId
                    )

                    ? {
                        ...previousUser,
                        isOnline,
                        lastSeen,
                      }

                    : previousUser
              );
            };


          // =============================================
          // TYPING
          // =============================================

          const onTyping =
            ({
              userId,
              isTyping,
            }) => {

              if (
                idOf(
                  selectedUserRef.current
                ) ===
                String(
                  userId
                )
              ) {

                setTyping(
                  Boolean(
                    isTyping
                  )
                );
              }
            };


          // =============================================
          // REACTION
          // =============================================

          const onReaction =
            (
              updated
            ) => {

              setMessages(
                (
                  previousMessages
                ) =>

                  previousMessages.map(
                    (
                      message
                    ) =>

                      idOf(
                        message
                      ) ===
                      idOf(
                        updated
                      )

                        ? updated

                        : message
                  )
              );
            };


          // =============================================
          // MESSAGE DELETE
          // =============================================

          const onDeleted =
            ({
              messageId,
            }) => {

              setMessages(
                (
                  previousMessages
                ) =>

                  previousMessages.map(
                    (
                      message
                    ) =>

                      idOf(
                        message
                      ) ===
                      String(
                        messageId
                      )

                        ? {
                            ...message,

                            deletedForEveryone:
                              true,

                            content:
                              '',

                            mediaUrl:
                              '',

                            reactions:
                              [],
                          }

                        : message
                  )
              );
            };


          const onStatus =
            () => {

              loadStatuses();
            };


          const onStatusUpdate =
            ({
              messageIds,
              messageStatus,
            }) => {

              const ids =
                new Set(
                  (
                    messageIds ||
                    []
                  ).map(
                    String
                  )
                );


              setMessages(
                (
                  previousMessages
                ) =>

                  previousMessages.map(
                    (
                      message
                    ) =>

                      ids.has(
                        idOf(
                          message
                        )
                      )

                        ? {
                            ...message,
                            messageStatus,
                          }

                        : message
                  )
              );
            };


          // =================================================
          // INCOMING VIDEO CALL
          // =================================================

          const onIncomingVideoCall =
            ({
              from,
              offer,
            }) => {

              if (
                !from ||
                !offer
              ) {

                return;
              }


              // Already busy
              if (
                activeCallPeerRef.current &&
                activeCallPeerRef.current !==
                  String(
                    from
                  )
              ) {

                socketInstance.emit(
                  'video_call_reject',
                  {

                    to:
                      String(
                        from
                      ),

                    reason:
                      'busy',

                  }
                );


                return;
              }


              activeCallPeerRef.current =
                String(
                  from
                );


              const caller =
                usersRef.current
                  .find(
                    (
                      user
                    ) =>

                      idOf(
                        user
                      ) ===
                      String(
                        from
                      )
                  );


              setActiveCallUser(
                caller || {

                  _id:
                    String(
                      from
                    ),

                  username:
                    'Incoming call',

                }
              );


              setIncomingCall({

                from:
                  String(
                    from
                  ),

                offer,

              });


              setCallState(
                'incoming'
              );
            };


          // =================================================
          // VIDEO CALL ANSWER
          // =================================================

          const onVideoCallAccepted =
            async ({
              from,
              answer,
            }) => {

              if (
                !answer ||
                String(
                  from
                ) !==
                  String(
                    activeCallPeerRef.current
                  )
              ) {

                return;
              }


              const peer =
                peerConnectionRef.current;


              if (
                !peer
              ) {

                return;
              }


              try {

                await peer
                  .setRemoteDescription(
                    new RTCSessionDescription(
                      answer
                    )
                  );


                await flushIceCandidates();


                setCallState(
                  'connected'
                );

              } catch (
                error
              ) {

                console.error(
                  'Video answer error:',
                  error
                );


                cleanupVideoCall(
                  false
                );


                toast.error(
                  'Unable to connect video call'
                );
              }
            };


          // =================================================
          // ICE CANDIDATE
          // =================================================

          const onVideoCallIce =
            async ({
              from,
              candidate,
            }) => {

              if (
                !candidate
              ) {

                return;
              }


              if (
                String(
                  from
                ) !==
                String(
                  activeCallPeerRef.current
                )
              ) {

                return;
              }


              const peer =
                peerConnectionRef.current;


              if (
                peer &&
                peer.remoteDescription
              ) {

                try {

                  await peer
                    .addIceCandidate(
                      candidate
                    );

                } catch (
                  error
                ) {

                  console.error(
                    'ICE candidate error:',
                    error
                  );
                }

              } else {

                pendingIceCandidatesRef.current
                  .push(
                    candidate
                  );
              }
            };


          // =================================================
          // CALL REJECTED
          // =================================================

          const onVideoCallRejected =
            ({
              reason,
            }) => {

              cleanupVideoCall(
                false
              );


              if (
                reason ===
                'busy'
              ) {

                toast.info(
                  'User is busy on another call'
                );

              } else {

                toast.info(
                  'Video call declined'
                );
              }
            };


          // =================================================
          // CALL ENDED
          // =================================================

          const onVideoCallEnded =
            () => {

              cleanupVideoCall(
                false
              );


              toast.info(
                'Video call ended'
              );
            };


          // =================================================
          // REGISTER CHAT SOCKET EVENTS
          // =================================================

          socketInstance.on(
            'receive_message',
            onReceive
          );


          socketInstance.on(
            'conversation_updated',
            onUpdated
          );


          socketInstance.on(
            'user_status',
            onUserStatus
          );


          socketInstance.on(
            'user_typing',
            onTyping
          );


          socketInstance.on(
            'reaction_update',
            onReaction
          );


          socketInstance.on(
            'message_deleted',
            onDeleted
          );


          socketInstance.on(
            'status_updated',
            onStatus
          );


          socketInstance.on(
            'message_status_update',
            onStatusUpdate
          );


          // =================================================
          // REGISTER VIDEO CALL EVENTS
          // =================================================

          socketInstance.on(
            'video_call_incoming',
            onIncomingVideoCall
          );


          socketInstance.on(
            'video_call_accepted',
            onVideoCallAccepted
          );


          socketInstance.on(
            'video_call_ice',
            onVideoCallIce
          );


          socketInstance.on(
            'video_call_rejected',
            onVideoCallRejected
          );


          socketInstance.on(
            'video_call_ended',
            onVideoCallEnded
          );


          // =================================================
          // CLEAN SOCKET LISTENERS
          // =================================================

          socketInstance
            .__cleanupWhatsapp =
            () => {

              socketInstance.off(
                'receive_message',
                onReceive
              );


              socketInstance.off(
                'conversation_updated',
                onUpdated
              );


              socketInstance.off(
                'user_status',
                onUserStatus
              );


              socketInstance.off(
                'user_typing',
                onTyping
              );


              socketInstance.off(
                'reaction_update',
                onReaction
              );


              socketInstance.off(
                'message_deleted',
                onDeleted
              );


              socketInstance.off(
                'status_updated',
                onStatus
              );


              socketInstance.off(
                'message_status_update',
                onStatusUpdate
              );


              socketInstance.off(
                'video_call_incoming',
                onIncomingVideoCall
              );


              socketInstance.off(
                'video_call_accepted',
                onVideoCallAccepted
              );


              socketInstance.off(
                'video_call_ice',
                onVideoCallIce
              );


              socketInstance.off(
                'video_call_rejected',
                onVideoCallRejected
              );


              socketInstance.off(
                'video_call_ended',
                onVideoCallEnded
              );
            };
        }
      )

      .catch(
        (
          error
        ) => {

          console.error(
            'Socket connection error:',
            error
          );
        }
      );


    return () => {

      mounted =
        false;


      if (
        socket
          ?.__cleanupWhatsapp
      ) {

        socket
          .__cleanupWhatsapp();
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentUser?._id,
  ]);


  // =====================================================
  // CLEAN CAMERA ON PAGE CLOSE
  // =====================================================

  useEffect(() => {

    return () => {

      acceptingCallRef.current =
        false;


      mediaRequestRef.current =
        null;


      try {

        peerConnectionRef.current
          ?.close();

      } catch (_) {}


      localStreamRef.current
        ?.getTracks()
        .forEach(
          (
            track
          ) => {

            track.stop();

          }
        );
    };

  }, []);


  // =====================================================
  // AUTO SCROLL
  // =====================================================

  useEffect(() => {

    messagesEndRef.current
      ?.scrollIntoView({

        behavior:
          'smooth',

        block:
          'nearest',

        inline:
          'nearest',

      });

  }, [
    messages,
    typing,
  ]);


  // =====================================================
  // SELECT USER
  // =====================================================

  async function selectUser(
    user
  ) {

    setSelectedUser(
      user
    );


    selectedUserRef.current =
      user;


    setTyping(
      false
    );


    const cid =
      user
        ?.conversation
        ?._id ||
      null;


    setConversationId(
      cid
    );


    setMessages(
      []
    );


    if (
      cid
    ) {

      try {

        const data =
          await getMessages(
            cid
          );


        setMessages(
          data
        );


        loadUsers();

      } catch (
        error
      ) {

        toast.error(
          error.message
        );
      }
    }
  }


  // =====================================================
  // REMOVE USER
  // =====================================================

  async function handleRemoveUser(
    user,
    event
  ) {

    event
      ?.stopPropagation();


    const userName =
      user?.username ||
      user?.fullPhoneNumber ||
      'this user';


    const confirmed =
      window.confirm(
        `Remove ${userName} from your chat list?`
      );


    if (
      !confirmed
    ) {

      return;
    }


    try {

      if (
        activeCallPeerRef.current ===
        idOf(
          user
        )
      ) {

        cleanupVideoCall(
          true
        );
      }


      await removeUserFromList(
        user._id
      );


      setUsers(
        (
          previousUsers
        ) =>

          previousUsers.filter(
            (
              item
            ) =>

              idOf(
                item
              ) !==
              idOf(
                user
              )
          )
      );


      if (
        idOf(
          selectedUserRef.current
        ) ===
        idOf(
          user
        )
      ) {

        setSelectedUser(
          null
        );


        selectedUserRef.current =
          null;


        setConversationId(
          null
        );


        setMessages(
          []
        );


        setTyping(
          false
        );
      }


      toast.success(
        'User removed from chat list'
      );

    } catch (
      error
    ) {

      toast.error(
        error.message ||
        'Unable to remove user'
      );
    }
  }


  // =====================================================
  // SEND MESSAGE
  // =====================================================

  async function handleSend(
    event
  ) {

    event
      ?.preventDefault();


    if (
      !selectedUser ||
      (
        !text.trim() &&
        !media
      ) ||
      sending
    ) {

      return;
    }


    setSending(
      true
    );


    try {

      const result =
        await sendMessage(

          selectedUser._id,

          text.trim(),

          media

        );


      if (
        result?.message
      ) {

        setMessages(
          (
            previousMessages
          ) =>

            previousMessages.some(
              (
                message
              ) =>

                idOf(
                  message
                ) ===
                idOf(
                  result.message
                )
            )

              ? previousMessages

              : [
                  ...previousMessages,
                  result.message,
                ]
        );
      }


      if (
        result
          ?.conversationId
      ) {

        setConversationId(
          String(
            result
              .conversationId
          )
        );
      }


      setText(
        ''
      );


      setMedia(
        null
      );


      if (
        fileRef.current
      ) {

        fileRef.current.value =
          '';
      }


      socketRef.current?.emit(
        'typing_stop',
        {

          receiverId:
            selectedUser._id,

          conversationId:
            result
              ?.conversationId ||
            conversationId,

        }
      );


      loadUsers();

    } catch (
      error
    ) {

      toast.error(
        error.message
      );

    } finally {

      setSending(
        false
      );
    }
  }


  // =====================================================
  // TYPING
  // =====================================================

  function onTypingChange(
    value
  ) {

    setText(
      value
    );


    if (
      !selectedUser
    ) {

      return;
    }


    socketRef.current?.emit(
      'typing_start',
      {

        receiverId:
          selectedUser._id,

        conversationId,

      }
    );


    clearTimeout(
      typingTimer.current
    );


    typingTimer.current =
      setTimeout(
        () => {

          socketRef.current?.emit(
            'typing_stop',
            {

              receiverId:
                selectedUser._id,

              conversationId,

            }
          );

        },
        900
      );
  }


  // =====================================================
  // REACTION
  // =====================================================

  async function handleReaction(
    messageId,
    emoji
  ) {

    try {

      const updated =
        await reactToMessage(
          messageId,
          emoji
        );


      setMessages(
        (
          previousMessages
        ) =>

          previousMessages.map(
            (
              message
            ) =>

              idOf(
                message
              ) ===
              idOf(
                updated
              )

                ? updated

                : message
          )
      );

    } catch (
      error
    ) {

      toast.error(
        error.message
      );
    }
  }


  // =====================================================
  // DELETE MESSAGE
  // =====================================================

  async function handleDelete(
    messageId
  ) {

    try {

      await deleteMessage(
        messageId
      );


      setMessages(
        (
          previousMessages
        ) =>

          previousMessages.map(
            (
              message
            ) =>

              idOf(
                message
              ) ===
              String(
                messageId
              )

                ? {

                    ...message,

                    deletedForEveryone:
                      true,

                    content:
                      '',

                    mediaUrl:
                      '',

                    reactions:
                      [],

                  }

                : message
          )
      );


      loadUsers();

    } catch (
      error
    ) {

      toast.error(
        error.message
      );
    }
  }


  // =====================================================
  // CREATE STATUS
  // =====================================================

  async function handleCreateStatus(
    event
  ) {

    event
      .preventDefault();


    if (
      !statusText.trim() &&
      !statusMedia
    ) {

      return;
    }


    try {

      await createStatus(
        statusText.trim(),
        statusMedia
      );


      setStatusText(
        ''
      );


      setStatusMedia(
        null
      );


      await loadStatuses();


      toast.success(
        'Status posted'
      );

    } catch (
      error
    ) {

      toast.error(
        error.message
      );
    }
  }


  // =====================================================
  // VIEW STATUS
  // =====================================================

  async function viewStatus(
    status
  ) {

    setOpenStatus(
      status
    );


    if (
      idOf(
        status.user
      ) !==
      idOf(
        currentUser
      )
    ) {

      await markStatusViewed(
        status._id
      );
    }


    loadStatuses();
  }


  // =====================================================
  // REMOVE STATUS
  // =====================================================

  async function removeStatus(
    statusId
  ) {

    try {

      await deleteStatus(
        statusId
      );


      setOpenStatus(
        null
      );


      loadStatuses();

    } catch (
      error
    ) {

      toast.error(
        error.message
      );
    }
  }


  // =====================================================
  // SAVE PROFILE
  // =====================================================

  async function saveProfile(
    event
  ) {

    event
      .preventDefault();


    const form =
      new FormData();


    form.append(
      'username',
      profileName.trim()
    );


    form.append(
      'about',
      profileAbout.trim()
    );


    if (
      profilePhoto
    ) {

      form.append(
        'profilepicture',
        profilePhoto
      );
    }


    try {

      const result =
        await updateUserProfile(
          form
        );


      setCurrentUser(
        result.data
      );


      setProfileOpen(
        false
      );


      setProfilePhoto(
        null
      );


      toast.success(
        'Profile updated'
      );

    } catch (
      error
    ) {

      toast.error(
        error.message
      );
    }
  }


  // =====================================================
  // LOGOUT
  // =====================================================

  async function handleLogout() {

    if (
      activeCallPeerRef.current
    ) {

      cleanupVideoCall(
        true
      );
    }


    try {

      await logoutUser();

    } catch (_) {}


    disconnectSocket();


    clearUser();


    window.location.href =
      '/user-login';
  }


  // =====================================================
  // FILTER USERS
  // =====================================================

  const filteredUsers =
    useMemo(
      () => {

        const query =
          search
            .toLowerCase()
            .trim();


        return users.filter(
          (
            user
          ) => {

            if (
              !query
            ) {

              return true;
            }


            const value =
              `${
                user.username ||
                ''
              } ${
                user.fullPhoneNumber ||
                ''
              } ${
                user.about ||
                ''
              }`
                .toLowerCase();


            return value.includes(
              query
            );
          }
        );

      },
      [
        users,
        search,
      ]
    );


  // =====================================================
  // GROUP STATUS
  // =====================================================

  const groupedStatuses =
    useMemo(
      () => {

        const map =
          new Map();


        statuses.forEach(
          (
            status
          ) => {

            const key =
              idOf(
                status.user
              );


            if (
              !map.has(
                key
              )
            ) {

              map.set(
                key,
                {

                  user:
                    status.user,

                  items:
                    [],

                }
              );
            }


            map
              .get(
                key
              )
              .items
              .push(
                status
              );
          }
        );


        return [
          ...map.values(),
        ];

      },
      [
        statuses,
      ]
    );


  // =====================================================
  // UI
  // =====================================================

  return (

    <div
      className={`whatsapp-shell ${
        theme ===
        'dark'
          ? 'dark'
          : ''
      }`}
    >


      {/* LEFT ICON RAIL */}

      <aside
        className="icon-rail"
      >

        <button
          className="profile-icon"
          onClick={() =>
            setProfileOpen(
              true
            )
          }
          title="Profile"
        >

          <img
            src={avatarOf(
              currentUser
            )}
            alt="Me"
          />

        </button>


        <button
          className={
            activeTab ===
            'chats'
              ? 'rail-active'
              : ''
          }
          onClick={() =>
            setActiveTab(
              'chats'
            )
          }
          title="Chats"
        >

          💬

        </button>


        <button
          className={
            activeTab ===
            'status'
              ? 'rail-active'
              : ''
          }
          onClick={() =>
            setActiveTab(
              'status'
            )
          }
          title="Status"
        >

          ◉

        </button>


        <div
          className="rail-spacer"
        />


        <button
          onClick={
            toggleTheme
          }
          title="Theme"
        >

          {theme ===
          'dark'
            ? '☀'
            : '☾'}

        </button>


        <button
          onClick={
            handleLogout
          }
          title="Logout"
        >

          ↪

        </button>

      </aside>


      {/* SIDEBAR */}

      <section
        className={`sidebar-panel ${
          selectedUser
            ? 'mobile-hidden'
            : ''
        }`}
      >

        {activeTab ===
        'chats' ? (

          <>

            <div
              className="sidebar-header"
            >

              <h2>
                Chats
              </h2>


              <button
                className="round-button"
                onClick={
                  loadUsers
                }
              >

                ↻

              </button>

            </div>


            <div
              className="search-box"
            >

              ⌕


              <input
                value={
                  search
                }
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search or start new chat"
              />

            </div>


            <div
              className="contact-list"
            >

              {filteredUsers.length ===
                0 && (

                <div
                  className="empty-small"
                >

                  No other verified users yet.

                </div>

              )}


              {filteredUsers.map(
                (
                  user
                ) => (

                  <div
                    className="contact-row-wrapper"
                    key={
                      user._id
                    }
                  >

                    <button
                      type="button"
                      className={`contact-row ${
                        idOf(
                          selectedUser
                        ) ===
                        idOf(
                          user
                        )
                          ? 'selected'
                          : ''
                      }`}
                      onClick={() =>
                        selectUser(
                          user
                        )
                      }
                    >

                      <div
                        className="avatar-wrap"
                      >

                        <img
                          src={avatarOf(
                            user
                          )}
                          alt=""
                        />


                        {user.isOnline && (

                          <span
                            className="online-dot"
                          />

                        )}

                      </div>


                      <div
                        className="contact-main"
                      >

                        <div
                          className="contact-top"
                        >

                          <strong>

                            {user.username ||
                              user.fullPhoneNumber ||
                              'WhatsApp user'}

                          </strong>


                          <span>

                            {formatTime(
                              user
                                .conversation
                                ?.lastMessage
                                ?.createdAt ||
                              user
                                .conversation
                                ?.updatedAt
                            )}

                          </span>

                        </div>


                        <div
                          className="contact-bottom"
                        >

                          <span>

                            {messagePreview(
                              user
                            )}

                          </span>


                          {user.unreadCount >
                            0 && (

                            <b>

                              {
                                user.unreadCount
                              }

                            </b>

                          )}

                        </div>

                      </div>

                    </button>


                    {/* REMOVE USER */}

                    <button
                      type="button"
                      className="contact-delete-button"
                      title="Remove from chat list"
                      aria-label="Remove from chat list"
                      onClick={(
                        event
                      ) =>
                        handleRemoveUser(
                          user,
                          event
                        )
                      }
                    >

                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >

                        <path
                          d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-2 6h10l-.7 11H7.7L7 9Zm3 2v7h2v-7h-2Zm4 0v7h2v-7h-2Z"
                          fill="currentColor"
                        />

                      </svg>

                    </button>

                  </div>

                )
              )}

            </div>

          </>

        ) : (

          <>

            <div
              className="sidebar-header"
            >

              <h2>
                Status
              </h2>


              <button
                className="round-button"
                onClick={
                  loadStatuses
                }
              >

                ↻

              </button>

            </div>


            <form
              className="status-create"
              onSubmit={
                handleCreateStatus
              }
            >

              <div
                className="status-me"
              >

                <img
                  src={avatarOf(
                    currentUser
                  )}
                  alt="Me"
                />


                <div>

                  <strong>
                    My status
                  </strong>

                  <small>
                    Post text, photo or video
                  </small>

                </div>

              </div>


              <textarea
                value={
                  statusText
                }
                onChange={(
                  event
                ) =>
                  setStatusText(
                    event.target.value
                  )
                }
                placeholder="What's happening?"
                rows={3}
              />


              <div
                className="status-actions"
              >

                <label
                  className="attach-label"
                >

                  ＋ Media


                  <input
                    type="file"
                    accept="image/*,video/*"
                    hidden
                    onChange={(
                      event
                    ) =>
                      setStatusMedia(
                        event.target.files?.[0] ||
                        null
                      )
                    }
                  />

                </label>


                <button
                  className="primary-mini"
                >

                  Post

                </button>

              </div>


              {statusMedia && (

                <small
                  className="file-chip"
                >

                  {
                    statusMedia.name
                  }

                </small>

              )}

            </form>


            <div
              className="status-list"
            >

              {groupedStatuses.map(
                (
                  group
                ) => (

                  <button
                    className="status-row"
                    key={
                      idOf(
                        group.user
                      )
                    }
                    onClick={() =>
                      viewStatus(
                        group.items[0]
                      )
                    }
                  >

                    <div
                      className="status-ring"
                    >

                      <img
                        src={avatarOf(
                          group.user
                        )}
                        alt=""
                      />

                    </div>


                    <div>

                      <strong>

                        {idOf(
                          group.user
                        ) ===
                        idOf(
                          currentUser
                        )

                          ? 'My status'

                          : group.user
                              ?.username ||
                            'User'}

                      </strong>


                      <small>

                        {
                          group.items.length
                        }{' '}

                        update

                        {group.items.length >
                        1
                          ? 's'
                          : ''}

                        {' '}·{' '}

                        {formatTime(
                          group.items[0]
                            .createdAt
                        )}

                      </small>

                    </div>

                  </button>

                )
              )}


              {!groupedStatuses.length && (

                <div
                  className="empty-small"
                >

                  No active status updates.

                </div>

              )}

            </div>

          </>

        )}

      </section>


      {/* CHAT PANEL */}

      <main
        className={`chat-panel ${
          selectedUser
            ? 'mobile-visible'
            : ''
        }`}
      >

        {selectedUser &&
        activeTab ===
          'chats' ? (

          <>

            <header
              className="chat-header"
            >

              <button
                className="mobile-back"
                onClick={() =>
                  setSelectedUser(
                    null
                  )
                }
              >

                ←

              </button>


              <img
                src={avatarOf(
                  selectedUser
                )}
                alt=""
              />


              <div>

                <strong>

                  {selectedUser.username ||
                    selectedUser.fullPhoneNumber}

                </strong>


                <small>

                  {typing
                    ? 'typing…'
                    : lastSeenText(
                        selectedUser
                      )}

                </small>

              </div>


              <div
                className="chat-header-actions"
              >


                {/* VIDEO CALL */}

                <button
                  type="button"
                  className="video-call-button"
                  title="Video call"
                  aria-label="Video call"
                  onClick={
                    startVideoCall
                  }
                  disabled={
                    callState !==
                    'idle'
                  }
                >

                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >

                    <path
                      fill="currentColor"
                      d="M4 5h11a2 2 0 0 1 2 2v2.5l4-2.5v10l-4-2.5V17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v10h11V7H4Z"
                    />

                  </svg>

                </button>


                <button
                  type="button"
                  title="Search"
                >

                  ⌕

                </button>


                <button
                  type="button"
                  title="More"
                >

                  ⋮

                </button>

              </div>

            </header>


            {/* MESSAGES */}

            <div
              className="messages-area"
            >

              <div
                className="encryption-note"
              >

                🔒 Messages in this demo are delivered through your own backend and database.

              </div>


              {messages.map(
                (
                  message
                ) => {

                  const mine =
                    idOf(
                      message.sender
                    ) ===
                    idOf(
                      currentUser
                    );


                  const reactions =
                    message.reactions ||
                    [];


                  return (

                    <div
                      className={`message-line ${
                        mine
                          ? 'mine'
                          : 'theirs'
                      }`}
                      key={
                        message._id
                      }
                    >

                      <div
                        className={`message-bubble ${
                          message
                            .deletedForEveryone
                            ? 'deleted'
                            : ''
                        }`}
                      >

                        {message
                          .deletedForEveryone ? (

                          <em>

                            🚫 This message was deleted

                          </em>

                        ) : (

                          <>

                            {message
                              .contentType ===
                              'image' &&
                              message
                                .mediaUrl && (

                                <img
                                  className="message-media"
                                  src={
                                    message.mediaUrl
                                  }
                                  alt="Shared"
                                />

                              )}


                            {message
                              .contentType ===
                              'video' &&
                              message
                                .mediaUrl && (

                                <video
                                  className="message-media"
                                  src={
                                    message.mediaUrl
                                  }
                                  controls
                                />

                              )}


                            {message
                              .content && (

                              <div
                                className="message-text"
                              >

                                {
                                  message.content
                                }

                              </div>

                            )}

                          </>

                        )}


                        <div
                          className="message-meta"
                        >

                          <span>

                            {formatTime(
                              message.createdAt
                            )}

                          </span>


                          {mine && (

                            <span
                              className={
                                message
                                  .messageStatus ===
                                'read'

                                  ? 'status-read'

                                  : ''
                              }
                            >

                              {message
                                .messageStatus ===
                              'sent'
                                ? '✓'
                                : '✓✓'}

                            </span>

                          )}

                        </div>


                        {!message
                          .deletedForEveryone && (

                          <div
                            className="message-tools"
                          >

                            {[
                              '👍',
                              '❤️',
                              '😂',
                            ].map(
                              (
                                emoji
                              ) => (

                                <button
                                  key={
                                    emoji
                                  }
                                  onClick={() =>
                                    handleReaction(
                                      message._id,
                                      emoji
                                    )
                                  }
                                >

                                  {
                                    emoji
                                  }

                                </button>

                              )
                            )}


                            {mine && (

                              <button
                                onClick={() =>
                                  handleDelete(
                                    message._id
                                  )
                                }
                              >

                                🗑

                              </button>

                            )}

                          </div>

                        )}


                        {reactions.length >
                          0 && (

                          <div
                            className="reaction-pill"
                          >

                            {reactions.map(
                              (
                                reaction,
                                index
                              ) => (

                                <span
                                  key={`${idOf(
                                    reaction.user
                                  )}-${index}`}
                                >

                                  {
                                    reaction.emoji
                                  }

                                </span>

                              )
                            )}

                          </div>

                        )}

                      </div>

                    </div>

                  );
                }
              )}


              {typing && (

                <div
                  className="typing-bubble"
                >

                  <span />
                  <span />
                  <span />

                </div>

              )}


              <div
                ref={
                  messagesEndRef
                }
              />

            </div>


            {/* MEDIA PREVIEW */}

            {media && (

              <div
                className="media-preview-bar"
              >

                <span>

                  Attachment: {
                    media.name
                  }

                </span>


                <button
                  type="button"
                  onClick={() =>
                    setMedia(
                      null
                    )
                  }
                >

                  ×

                </button>

              </div>

            )}


            {/* COMPOSER */}

            <form
              className="composer"
              onSubmit={
                handleSend
              }
            >

              <label
                className="composer-icon"
                title="Attach photo/video"
              >

                ＋


                <input
                  ref={
                    fileRef
                  }
                  type="file"
                  accept="image/*,video/*"
                  hidden
                  onChange={(
                    event
                  ) =>
                    setMedia(
                      event
                        .target
                        .files?.[0] ||
                        null
                    )
                  }
                />

              </label>


              <input
                value={
                  text
                }
                onChange={(
                  event
                ) =>
                  onTypingChange(
                    event.target.value
                  )
                }
                placeholder="Type a message"
              />


              <button
                className="send-button"
                disabled={
                  sending ||
                  (
                    !text.trim() &&
                    !media
                  )
                }
              >

                {sending
                  ? '…'
                  : '➤'}

              </button>

            </form>

          </>

        ) : (

          <div
            className="welcome-pane"
          >

            <div
              className="welcome-graphic"
            >

              💬

            </div>


            <h1>

              WhatsApp Clone

            </h1>


            <p>

              Send and receive messages without keeping your phone connected. Choose a contact to begin.

            </p>


            <small>

              🔒 Built as a full-stack learning project.

            </small>

          </div>

        )}

      </main>


      {/* =================================================
          STATUS MODAL
          ================================================= */}

      {openStatus && (

        <div
          className="modal-backdrop"
          onClick={() =>
            setOpenStatus(
              null
            )
          }
        >

          <div
            className="status-viewer"
            onClick={(
              event
            ) =>
              event
                .stopPropagation()
            }
          >

            <div
              className="status-viewer-head"
            >

              <div>

                <img
                  src={avatarOf(
                    openStatus.user
                  )}
                  alt=""
                />


                <span>

                  <strong>

                    {openStatus
                      .user
                      ?.username ||
                      'Status'}

                  </strong>


                  <small>

                    {formatTime(
                      openStatus.createdAt
                    )}

                  </small>

                </span>

              </div>


              <button
                type="button"
                onClick={() =>
                  setOpenStatus(
                    null
                  )
                }
              >

                ×

              </button>

            </div>


            <div
              className="status-content"
            >

              {openStatus.contentType ===
                'image' && (

                <img
                  src={
                    openStatus.mediaUrl
                  }
                  alt="Status"
                />

              )}


              {openStatus.contentType ===
                'video' && (

                <video
                  src={
                    openStatus.mediaUrl
                  }
                  controls
                  autoPlay
                />

              )}


              {openStatus.content && (

                <p>

                  {
                    openStatus.content
                  }

                </p>

              )}

            </div>


            {idOf(
              openStatus.user
            ) ===
              idOf(
                currentUser
              ) && (

              <div
                className="status-footer"
              >

                <span>

                  👁 {
                    openStatus
                      .viewers
                      ?.length ||
                    0
                  } views

                </span>


                <button
                  type="button"
                  onClick={() =>
                    removeStatus(
                      openStatus._id
                    )
                  }
                >

                  Delete status

                </button>

              </div>

            )}

          </div>

        </div>

      )}


      {/* =================================================
          PROFILE MODAL
          ================================================= */}

      {profileOpen && (

        <div
          className="modal-backdrop"
          onClick={() =>
            setProfileOpen(
              false
            )
          }
        >

          <form
            className="profile-modal"
            onSubmit={
              saveProfile
            }
            onClick={(
              event
            ) =>
              event
                .stopPropagation()
            }
          >

            <div
              className="modal-title"
            >

              <h3>
                Profile
              </h3>


              <button
                type="button"
                onClick={() =>
                  setProfileOpen(
                    false
                  )
                }
              >

                ×

              </button>

            </div>


            <img
              className="profile-large"
              src={
                profilePhoto
                  ? URL
                      .createObjectURL(
                        profilePhoto
                      )
                  : avatarOf(
                      currentUser
                    )
              }
              alt="Profile"
            />


            <label
              className="attach-label profile-photo-label"
            >

              Change photo


              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(
                  event
                ) =>
                  setProfilePhoto(
                    event.target.files?.[0] ||
                    null
                  )
                }
              />

            </label>


            <label>

              Name


              <input
                value={
                  profileName
                }
                onChange={(
                  event
                ) =>
                  setProfileName(
                    event.target.value
                  )
                }
                maxLength={
                  40
                }
              />

            </label>


            <label>

              About


              <textarea
                value={
                  profileAbout
                }
                onChange={(
                  event
                ) =>
                  setProfileAbout(
                    event.target.value
                  )
                }
                maxLength={
                  140
                }
                rows={
                  3
                }
              />

            </label>


            <button
              className="primary-btn"
            >

              Save profile

            </button>

          </form>

        </div>

      )}


      {/* =================================================
          VIDEO CALL WINDOW
          ================================================= */}

      {callState !==
        'idle' && (

        <div
          className="video-call-overlay"
        >

          <div
            className="video-call-window"
          >


            {/* INCOMING CALL */}

            {callState ===
            'incoming' ? (

              <div
                className="incoming-call-box"
              >

                <img
                  className="incoming-call-avatar"
                  src={avatarOf(
                    activeCallUser
                  )}
                  alt=""
                />


                <h2>

                  {activeCallUser
                    ?.username ||
                    activeCallUser
                      ?.fullPhoneNumber ||
                    'User'}

                </h2>


                <p>

                  Incoming video call...

                </p>


                <div
                  className="incoming-call-actions"
                >

                  {/* REJECT */}

                  <button
                    type="button"
                    className="call-reject-button"
                    title="Reject"
                    onClick={
                      rejectVideoCall
                    }
                  >

                    ✕

                  </button>


                  {/* ACCEPT */}

                  <button
                    type="button"
                    className="call-accept-button"
                    title="Accept video call"
                    onClick={
                      acceptVideoCall
                    }
                  >

                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >

                      <path
                        fill="currentColor"
                        d="M4 5h11a2 2 0 0 1 2 2v2.5l4-2.5v10l-4-2.5V17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v10h11V7H4Z"
                      />

                    </svg>

                  </button>

                </div>

              </div>

            ) : (

              <>


                {/* VIDEO CALL HEADER */}

                <div
                  className="video-call-header"
                >

                  <div>

                    <strong>

                      {activeCallUser
                        ?.username ||
                        activeCallUser
                          ?.fullPhoneNumber ||
                        'Video call'}

                    </strong>


                    <small>

                      {callState ===
                      'calling'

                        ? 'Calling...'

                        : callState ===
                          'connecting'

                          ? 'Connecting...'

                          : 'Connected'}

                    </small>

                  </div>

                </div>


                {/* VIDEOS */}

                <div
                  className="remote-video-container"
                >


                  {/* REMOTE VIDEO */}

                  <video
                    ref={
                      remoteVideoRef
                    }
                    className="remote-video"
                    autoPlay
                    playsInline
                  />


                  {(callState ===
                    'calling' ||
                    callState ===
                    'connecting') && (

                    <div
                      className="calling-message"
                    >

                      {callState ===
                      'calling'
                        ? 'Calling...'
                        : 'Connecting...'}

                    </div>

                  )}


                  {/* MY VIDEO */}

                  <video
                    ref={
                      localVideoRef
                    }
                    className="local-video"
                    autoPlay
                    playsInline
                    muted
                  />

                </div>


                {/* END CALL */}

                <div
                  className="video-call-controls"
                >

                  <button
                    type="button"
                    className="call-end-button"
                    onClick={
                      endVideoCall
                    }
                  >

                    ✕ End Call

                  </button>

                </div>

              </>

            )}

          </div>

        </div>

      )}

    </div>
  );
}