'use client'
import { motion } from 'framer-motion';
import Hero from '@/components/hero';
import PracticeAreas from '@/components/practice-areas';
import Stats from '@/components/stats';
import Experience from '@/components/experience';
import Team from '@/components/team';
import BlogPosts from '@/components/blog-posts';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
     
      <motion.section 
        className="py-16 text-center space-y-4"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl font-serif font-bold">Say More, Faster. Experience Real-Time Messaging.</h2>
        <p className="max-w-3xl mx-auto text-muted-foreground px-4 text-lg leading-relaxed">
        Stay connected with the people who matter most through our real-time messaging app. Whether you're chatting with friends, collaborating with colleagues, or sharing special moments with loved ones, our platform ensures instant, secure, and seamless communication. With lightning-fast message delivery, end-to-end encryption, and a user-friendly interface, you can focus on what truly matters—meaningful conversations. Join us today and experience the future of messaging, where every word counts and every connection is just a tap away.
        </p>
        <Link href="/auth/login">
          <Button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300">
            Get Started
          </Button>
        </Link>
        </motion.section>
       


    </motion.div>
  );
}
