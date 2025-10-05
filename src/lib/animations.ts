import confetti from 'canvas-confetti';

// Celebrate hitting daily calorie goal
export function celebrateCalorieGoal() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#ff6b35', '#f7931e', '#fdc23e'],
    zIndex: 9999
  });
}

// Celebrate hitting protein goal
export function celebrateProteinGoal() {
  // Trophy animation - dual side burst
  confetti({
    particleCount: 50,
    angle: 60,
    spread: 55,
    origin: { x: 0 },
    colors: ['#FFD700', '#FFA500'],
    zIndex: 9999
  });
  confetti({
    particleCount: 50,
    angle: 120,
    spread: 55,
    origin: { x: 1 },
    colors: ['#FFD700', '#FFA500'],
    zIndex: 9999
  });
}

// Celebrate workout completion
export function celebrateWorkout() {
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#ff0000', '#ff4500', '#ff6347'],
    startVelocity: 40,
    zIndex: 9999
  });
}

// Celebrate streak milestone
export function celebrateStreak(days: number) {
  // Special celebration for week milestones
  if (days % 7 === 0) {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#ff6b35', '#f7931e'],
        zIndex: 9999
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#ff6b35', '#f7931e'],
        zIndex: 9999
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  } else {
    // Regular streak celebration
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#ff6b35', '#f7931e', '#fdc23e'],
      zIndex: 9999
    });
  }
}

// Celebrate weight milestone
export function celebrateWeightMilestone() {
  // Star burst animation
  confetti({
    particleCount: 100,
    startVelocity: 30,
    spread: 360,
    origin: { x: 0.5, y: 0.5 },
    colors: ['#00ff00', '#32cd32', '#90ee90'],
    zIndex: 9999
  });
}

// Celebrate adding first meal/workout of the day
export function celebrateFirstEntry() {
  confetti({
    particleCount: 30,
    spread: 45,
    origin: { y: 0.65 },
    colors: ['#3b82f6', '#8b5cf6', '#ec4899'],
    zIndex: 9999
  });
}

// Mega celebration for major achievements
export function megaCelebration() {
  const duration = 5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Rainbow confetti from random positions
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });
  }, 250);
}
