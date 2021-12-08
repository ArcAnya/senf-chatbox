import React, { useEffect, useState } from 'react'
import { db, auth, storage } from '../firebase'
import { collection, query, where, onSnapshot, addDoc, Timestamp, orderBy, setDoc, doc, getDoc, updateDoc } from 'firebase/firestore'
import User from '../components/User'
import MessageForm from '../components/MessageForm'
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage'
import Message from '../components/Message'
import { useTranslation } from "react-i18next"


const Home = () => {
    const [users, setUsers] = useState([])
    const [chat, setChat] = useState("")
    const [text, setText] = useState("")
    const [img, setImg] = useState("")
    const [msgs, setMsgs] = useState("")
    const { t } = useTranslation()
    const [searchTerm, setSearchTerm] = useState("");

    const user1 = auth.currentUser.uid

    useEffect(() => {
        const usersRef = collection(db, 'users')
        // querying the entire users collection except the currentUser
        const q = query(usersRef, where('uid', 'not-in', [user1]))
        const unsub = onSnapshot(q, querySnapshot => {
            let users = []
            querySnapshot.forEach(doc => {
                users.push(doc.data())
            })
            setUsers(users);
        })
        return () => unsub()
    }, [user1])

    const selectUser = async (user) => {
        setChat(user)

        const user2 = user.uid
        const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`

        const msgsRef = collection(db, "messages", id, "chat")
        const q = query(msgsRef, orderBy("createdAt", "asc"))

        onSnapshot(q, querySnapshot => {
            let msgs = []
            querySnapshot.forEach(doc => {
                msgs.push(doc.data())
            })
            setMsgs(msgs)
        })

        // get last msg between logged in user and selected user
        const docSnap = await getDoc(doc(db, "lastMsg", id))
        // if last message exists and msg is from selected user
        if (docSnap.data() && docSnap.data().from !== user1) {
            // update last message doc, set unread to false
            await updateDoc(doc(db, "lastMsg", id), {
                unread: false
            })
        }
    }


    const handleSubmit = async e => {
        e.preventDefault()
        const user2 = chat.uid
        // create id for Document, make sure that it's the same no matter whether user1 or user2 writes 
        const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`

        let url;
        if (img) {
            const imgRef = ref(storage, `images/${new Date().getTime()} - ${img.name}`)
            const snap = await uploadBytes(imgRef, img)
            const dlUrl = await getDownloadURL(ref(storage, snap.ref.fullPath))
            url = dlUrl
        }

        await addDoc(collection(db, "messages", id, 'chat'), {
            text,
            from: user1,
            to: user2,
            createdAt: Timestamp.fromDate(new Date()),
            media: url || ""
        })

        await setDoc(doc(db, "lastMsg", id), {
            text,
            from: user1,
            to: user2,
            createdAt: Timestamp.fromDate(new Date()),
            media: url || "",
            unread: true,
        })

        setText("")
    }

    return (
        <div className='home_container'>
            <div className='users_container'>
                <input
                    type="text"
                    placeholder={t("search_for_people")}
                    onChange={(event) => { setSearchTerm(event.target.value) }}
                />
                {searchTerm ? (
                    <div className='users_search'>
                        {users.filter((val) => {
                            if (val.name.toLowerCase().includes(searchTerm.toLocaleLowerCase())) {
                                return val
                            } else {
                                return ""
                            }
                        }
                        ).map((val, key) => {
                            return (
                                <div key={key}>
                                    <p>{val.name}</p>
                                </div>
                            )
                        })}
                    </div>)
                    :
                    null
                }

                {users.map(user => <User key={user.uid} user={user} selectUser={selectUser} user1={user1} chat={chat} />)}
            </div>
            <div className="messages_container">
                {chat ? (
                    <>
                        <div className="messages_user">
                            <h3>{chat.name}</h3>
                        </div>
                        <div className="messages">
                            {msgs.length ? msgs.map((msg, i) => <Message key={i} msg={msg} user1={user1} />)
                                : null
                            }
                        </div>
                        <MessageForm handleSubmit={handleSubmit} text={text} setText={setText} setImg={setImg} />
                    </>
                ) : (
                    <h3 className="no_conv">Select a user to start conversation</h3>
                )}
            </div>
        </div>
    )
}

export default Home
