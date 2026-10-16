"use client";

import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

interface CountdownTimerProps {
  onExpire?: (expired: boolean) => void;
  className?: string;
}

export default function CountdownTimer({ onExpire, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    let endTime: number;
    let endTimeStr: string | null = null;

    if (typeof window !== 'undefined') {
      endTimeStr = localStorage.getItem("e_voting_election_end");
    }

    if (!endTimeStr) {
      endTime = Date.now() + (1 * 60 * 60 + 30 * 60) * 1000;
      if (typeof window !== 'undefined') {
        localStorage.setItem("e_voting_election_end", endTime.toString());
      }
    } else {
      endTime = parseInt(endTimeStr, 10);
    }

    const calculateTimeLeft = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((endTime - now) / 1000));

      if (diff <= 0) {
        setTimeLeft({
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0,
          isExpired: true,
        });
        if (onExpire) {
          onExpire(true);
        }
        return true;
      }

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      setTimeLeft({
        hours,
        minutes,
        seconds,
        totalSeconds: diff,
        isExpired: false,
      });

      if (onExpire) {
        onExpire(false);
      }
      return false;
    };

    calculateTimeLeft();
    const timer = setInterval(() => {
      const expired = calculateTimeLeft();
      if (expired) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [onExpire]);

  const padZero = (num: number) => String(num).padStart(2, "0");

  return (
    <div className={`countdown-timer-container ${timeLeft.isExpired ? "expired" : ""} ${className}`}>
      <div className="timer-header">
        <Clock className="timer-icon" size={18} />
        <span className="timer-title">
          {timeLeft.isExpired ? "Election Polls Closed" : "Active Polls Closing In"}
        </span>
      </div>

      {!timeLeft.isExpired ? (
        <div className="timer-digits-group">
          <div className="digit-box">
            <span className="digit-val">{padZero(timeLeft.hours)}</span>
            <span className="digit-lbl">HOURS</span>
          </div>
          <span className="digit-sep">:</span>
          <div className="digit-box">
            <span className="digit-val">{padZero(timeLeft.minutes)}</span>
            <span className="digit-lbl">MINS</span>
          </div>
          <span className="digit-sep">:</span>
          <div className="digit-box">
            <span className="digit-val">{padZero(timeLeft.seconds)}</span>
            <span className="digit-lbl">SECS</span>
          </div>
        </div>
      ) : (
        <div className="expired-badge">
          <AlertTriangle size={16} />
          <span>Voting Has Closed for 2024 Election</span>
        </div>
      )}
    </div>
  );
}
