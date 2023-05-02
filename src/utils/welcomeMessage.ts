type Greeting =
  | "Good morning"
  | "Good afternoon"
  | "Good evening"
  | "Good night";

function getGreeting(): Greeting {
  const hour = new Date().getHours();
  const greetingsMap: [number, Greeting][] = [
    [12, "Good morning"],
    [18, "Good afternoon"],
    [21, "Good evening"],
  ];

  const greeting =
    greetingsMap.find(([time]) => hour < time)?.[1] || "Good night";

  return greeting;
}

function welcomeMessage() {
  const greeting = getGreeting();
  return greeting;
}

export default welcomeMessage;
