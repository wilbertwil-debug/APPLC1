import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const contactId = searchParams.get("contactId")

    console.log("GET request - userId:", userId, "contactId:", contactId)

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // First check if table exists
    const { error: tableError } = await supabase.from("internal_chat_messages").select("id").limit(1)

    if (tableError) {
      console.error("Table check error:", tableError)
      return NextResponse.json(
        {
          error: `Database table error: ${tableError.message}`,
          details: "La tabla internal_chat_messages no existe o no es accesible",
        },
        { status: 500 },
      )
    }

    let query = supabase
      .from("internal_chat_messages")
      .select(`
        id,
        sender_id,
        receiver_id,
        message,
        created_at,
        sender:employees!sender_id(id, name, email),
        receiver:employees!receiver_id(id, name, email)
      `)
      .order("created_at", { ascending: true })

    if (contactId) {
      // Get messages between two specific users
      query = query.or(
        `and(sender_id.eq.${userId},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${userId})`,
      )
    } else {
      // Get all messages for the user
      query = query.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    }

    const { data: messages, error } = await query

    if (error) {
      console.error("Error fetching messages:", error)
      return NextResponse.json(
        {
          error: `Failed to fetch messages: ${error.message}`,
          details: error,
        },
        { status: 500 },
      )
    }

    console.log("Messages found:", messages?.length || 0)
    return NextResponse.json({ messages: messages || [] })
  } catch (error) {
    console.error("Internal chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { senderId, receiverId, message } = await request.json()

    console.log("POST request - senderId:", senderId, "receiverId:", receiverId, "message:", message)

    if (!senderId || !receiverId || !message) {
      return NextResponse.json({ error: "Sender ID, receiver ID, and message are required" }, { status: 400 })
    }

    // First check if table exists
    const { error: tableError } = await supabase.from("internal_chat_messages").select("id").limit(1)

    if (tableError) {
      console.error("Table check error:", tableError)
      return NextResponse.json(
        {
          error: `Database table error: ${tableError.message}`,
          details: "La tabla internal_chat_messages no existe o no es accesible",
        },
        { status: 500 },
      )
    }

    // Insert the message
    const { data, error } = await supabase
      .from("internal_chat_messages")
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        message: message.trim(),
      })
      .select(`
        id,
        sender_id,
        receiver_id,
        message,
        created_at,
        sender:employees!sender_id(id, name, email),
        receiver:employees!receiver_id(id, name, email)
      `)
      .single()

    if (error) {
      console.error("Error sending message:", error)
      return NextResponse.json(
        {
          error: `Failed to send message: ${error.message}`,
          details: error,
        },
        { status: 500 },
      )
    }

    console.log("Message sent successfully:", data)
    return NextResponse.json({ message: data })
  } catch (error) {
    console.error("Internal chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
