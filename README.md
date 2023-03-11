# My Project

This is a project about collecting statistics from live network traffics.

## Usage

To use this project, run one of the following commands:

sudo npm start or sudo yarn start

## Code Analysis

In this project we are capturing network packets on en0 network interface and analyzing the traffic to identify the top 10 IP addresses sending the most packets, as well as the amount of incoming and outgoing bytes.

The code uses Node.js three built-in modules:

- child_process
- readline
- os

Firstly we make use of the spawn() function from the child_process module to capture the network traffic on a specific network interfcae.
The spawn function receives two arguments. The name of the command and the command line arguments.
In our case, the command name is 'tcpdump' and the command line arguements are ["-nli", "en0"]. More thoroughly:

- The tcpdump is a command-line tool for network packet capture and analysis in Unix-like operating systems.
- The -i option refers to the name of the network interface to capture packets on.
- The -n option in the command-line arguments specifies that tcpdump should display network addresses as numbers rather than resolving them to hostnames.
- The -l option specifies that tcpdump should run in line-buffered mode, which means that it will output each captured packet as a separate line of text.
- The en0 argument specifies the network interface to capture packets on.

Next we are making use of the createInterface() function from the readline module to read and parse data from a readable stream.
We are setting 'tcpdump?.stdout' as the readable sream and specifying that that the input is not coming from a terminal or command prompt with the 'terminal:fasle' parameter.
Once the readline interface is created, it can be used to listen for events emitted by the input stream, such as the line event, which is emitted every time a new line of text is available from the stream.

Now we need to find our IP address.
To do that, we will make us of the networkInterfaces() function of the 'os' module to get information about the network interfaces available on the current system. Next, we iterate through the availbale interfaces of the en0 network (the one that we are currently capturing packets) and we attempt to find the first element where the family property is equal to "IPv4" and the internal property is falsy (meaning it's not an internal or loopback interface).

Moving forward, we setup a callback function that gets executed every time a new line is available in the rl interface that we previously created. The function splits the line into an array called data.
We know that the packet length is always placed after the string 'length', so we find the index of the string 'length' in the data array and add one to retrieve the packet length

Next, we check if the IP address already exists in the mostFrequent array. If it does, we increase its count; otherwise, we add it to the array.

Now, we need to determine if the packet is incoming or outgoing traffic. We do this by checking if the senderIP, which is located at index two of the data array, is equal to our IP address. If it is, then the traffic is outgoing; otherwise, it is incoming traffic.

Finally, we create a function that is doing the following every 10 seconds:

- Sorts the mostFrequent array in descending order based on the count property of each object.
- Logs the total bytes sent and received
- If the mostFrequent array has a length greater than zero, the function logs the top ten IPs with the highest count property to the console. If there are more than ten IPs in the array, the function logs the number of additional IPs that are not included in the top ten.

The code also includes error handling for the tcpdump command, and logs a message upon termination of the command.

## Key notes

We have used the setTimeout() function instead of the setInterval() because setInterval() is called every 10 seconds, even if the previous execution has not completed yet. However, setTimeout waits for the previous execution to complete before starting a new one.

- Time complexity: O(n log n)
