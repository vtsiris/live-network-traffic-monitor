const { spawn } = require("child_process");
const readline = require("readline");
const os = require("os");

// Capture network packets on the interface en0
const tcpdump = spawn("tcpdump", ["-nli", "en0"]);

// Get network interfaces
const interfaces = os.networkInterfaces();

// Create readline interface for reading input from stream
// tcpdump.stdout is the readable stream
// option 'terminal: false' specifies that input is not coming from terminal
const rl = readline.createInterface({
  input: tcpdump?.stdout,
  terminal: false,
});

let myIP = "";

// Filter out internal and IPv6 addresses
const addresses = interfaces.en0.flatMap(
  (iface) => iface?.family === "IPv4" && !iface?.internal && !!iface?.address
);
if (!!addresses?.length > 0) {
  myIP = addresses[1];
}

let outgoingBytes = 0;
let incomingBytes = 0;
const mostFrequent = [];

// Callback function that runs every time a new line is available to rl interface
rl.on("line", (line) => {
  const data = line.split(" ");

  const lengthIndex = data?.findIndex((d) => d === "length");

  let senderIP = "";
  if (!!data?.[2]) {
    senderIP = data[2];
  }

  const ipIndex = mostFrequent?.findIndex(
    (ip) => ip?.IP?.toString() === senderIP
  );

  if (ipIndex !== -1) {
    mostFrequent[ipIndex].count += 1;
  } else {
    mostFrequent.push({ IP: senderIP, count: 1 });
  }

  if (senderIP?.slice(0, 14) === myIP) {
    if (!!data[lengthIndex + 1]) {
      outgoingBytes += Number.parseInt(data[lengthIndex + 1]) || 0;
    }
  } else {
    if (!!data[lengthIndex + 1]) {
      incomingBytes += Number.parseInt(data[lengthIndex + 1]) || 0;
    }
  }
});

// Send results every 10 seconds
function sendResults() {
  mostFrequent?.sort((a, b) => b?.count - a?.count);

  if (!!outgoingBytes || !!incomingBytes) {
    console.log(`${outgoingBytes} bytes sent`);
    console.log(`${incomingBytes} bytes received`);
  }

  if (!!mostFrequent?.length) {
    console.log("Top ten IPs: ");
    let i = 0;
    while (i < 10) {
      if (!!mostFrequent[i]?.IP) {
        console.log(`${mostFrequent[i]?.IP} ${mostFrequent[i]?.count}`);
      }
      i++;
    }
    if (mostFrequent?.length > 10) {
      console.log(`+ ${mostFrequent?.length - 10} other IPs`);
    }
    console.log(" ");
  }
  setTimeout(sendResults, 10000);
}

sendResults();

// Capture errors from tcpdump
tcpdump.stderr.on("data", (data) => {
  console.error(`stderr: ${data}`);
});

// Log message upon termination of tcpdump
tcpdump.on("close", (code) => {
  console.log(`child process exited with code ${code}`);
});
