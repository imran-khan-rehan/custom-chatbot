"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { queryChatbot } from '@/services/api'; // Import the API function

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'ai';
};

export default function ChatView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null); // Store session ID
  const [isTyping, setIsTyping] = useState(false); // New state for typing indication
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to the bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Generate a random 4-digit session ID if one doesn't exist
  const getSessionId = () => {
    if (!sessionId) {
      const newSessionId = Math.floor(1000 + Math.random() * 9000).toString(); // Generate 4-digit session ID
      setSessionId(newSessionId);
      return newSessionId;
    }
    return sessionId;
  };

  // Handle sending the message
  const handleSend = async () => {
    if (input.trim()) {
      const newMessage: Message = { id: Date.now(), text: input, sender: 'user' };
      setMessages([...messages, newMessage]);
      setInput(''); // Clear input

      // Get or generate a session ID
      const currentSessionId = getSessionId();

      // Set AI typing state
      setIsTyping(true); // Show the typing indicator

      try {
        // Simulate a delay (e.g., 2 seconds) before showing the AI response
        setTimeout(async () => {
          // Call the API to query the chatbot
          const aiResponse = await queryChatbot(51, newMessage.text, currentSessionId); // Assuming userId is 36

          // Append AI response and hide typing indicator
          const aiMessage: Message = { id: Date.now(), text: aiResponse.answer, sender: 'ai' };
          setMessages(prev => [...prev, aiMessage]);
          setIsTyping(false); // Hide the typing indicator
        }, 2000); // Set the delay time in milliseconds (here it's 2 seconds)
        
      } catch (error) {
        console.error('Error querying chatbot:', error);
        const errorMessage: Message = { id: Date.now(), text: 'Error fetching AI response', sender: 'ai' };
        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false); // Hide typing on error
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto h-full flex flex-col">
          {/* Scrollable message area */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={message.sender === 'user' ? "/placeholder-user.jpg" : "/placeholder-ai.jpg"} />
                      <AvatarFallback>{message.sender === 'user' ? 'U' : 'AI'}</AvatarFallback>
                    </Avatar>
                    <div className={`rounded-lg p-2 max-w-md ${
                      message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                    }`}>
                      {message.text}
                    </div>
                  </div>
                </div>
              ))}

              {/* AI Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/placeholder-ai.jpg" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-2 max-w-md bg-gray-200">
                      <span className="animate-pulse">Typing<span className="dot1">.</span><span className="dot2">.</span><span className="dot3">.</span></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty div to ensure scroll-to-bottom */}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>
      {/* Input area */}
      <div className="border-t bg-white p-4">
        <div className="container mx-auto">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()} // Send on Enter key press
              className="flex-1"
            />
            <Button onClick={handleSend}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
