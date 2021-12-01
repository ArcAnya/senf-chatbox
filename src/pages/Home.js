import React, { useEffect, useState } from 'react'
import { db, auth } from '../firebase'
import { collection, query, where, onSnapshot, addDoc, Timestamp } from 'firebase/firestore'
import User from '../components/User'
import MessageForm from '../components/MessageForm'


const Home = () => {
    const [users, setUsers] = useState([])
    const [chat, setChat] = useState("")
    const [text, setText] = useState("")

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
    }, [])

    const selectUser = (user) => {
        setChat(user)
        console.log(user)
    }

    const handleSubmit = async e => {
        e.preventDefault()
        const user2 = chat.uid
        // create id for Document, make sure that it's the same no matter whether user1 or user2 writes 
        const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`
        await addDoc(collection(db, "messages", id, 'chat'), {
            text,
            from: user1,
            to: user2,
            createdAt: Timestamp.fromDate(new Date())
        })
        setText("")
    }

    console.log(users)
    return (
        <div className='home_container'>
            <div className='users_container'>
                {users.map(user => <User key={user.uid} user={user} selectUser={selectUser} />)}
            </div>
            <div className="messages_container">
                {chat ? (
                    <>
                        <div className="messages_user">
                            <h3>{chat.name}</h3>
                        </div>
                        <MessageForm handleSubmit={handleSubmit} text={text} setText={setText} />
                    </>
                ) : (
                    <h3 className="no_conv">Select a user to start conversation</h3>
                )}
            </div>
        </div>
    )
}

export default Home
