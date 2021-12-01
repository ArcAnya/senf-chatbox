import React, { useEffect, useState } from 'react'
import Img from '../icon-192.png'
import { onSnapshot, doc } from '@firebase/firestore'
import {db} from "../firebase"

const User = ({ user1, user, selectUser }) => {
    const user2 = user?.uid
    const [data, setData] = useState("")

    useEffect(() => {
        const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`
        let unsub = onSnapshot(doc(db, "lastMsg", id), doc => {
            setData(doc.data())
        })
        return () => unsub()
    }, [])

    console.log(data)

    return (
        <div className="user_wrapper" onClick={() => selectUser(user)}>
            <div className="user_info">
                <div className="user_detail">
                    <img src={user.avatar || Img} alt="avatar" className="avatar" />
                    <h4>{user.name}</h4>
                </div>
                <div className={`user_status ${user.isOnline ? 'online' : 'offline'}`}></div>
            </div>
        </div>
    )
}

export default User
