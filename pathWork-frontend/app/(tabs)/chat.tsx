import { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { GiftedChat } from 'react-native-gifted-chat'
import { supabase } from '@/lib/supabase';

export default function Chat() {
  const [messages, setMessages] = useState<any[]>([])
  const [user, setUser] = useState<User | null>()

  // Fetch the user from Supabase
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])


  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'Hello developer',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'React Native',
          avatar: 'https://placeimg.com/140/140/any',
        },
      },
    ])
  }, [])

  const onSend = useCallback((messages: any[] = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, messages),
    )
  }, [])

  return (
    <>
        {user && (
          <GiftedChat
            messages={messages}
            onSend={messages => onSend(messages)}
            user={{
              _id: user.id,
              name: user.user_metadata.name,
              avatar: user.user_metadata.avatar_url || 'https://placeimg.com/140/140/any',
            }}
          />
        )}
    </>
  )
}
