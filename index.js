const fs = require("fs");const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const file = "settings.json";

let data = {prefix: '.',
  welcome: "Welcome to our group!",
  goodbye: "Goodbye! Take care.",
  rules: "1. Respect everyone.\n2. No spam.\n3. Follow admin instructions.",
  replies: {},
  warnings: {},
  stats: { checked: 0, links: 0, spam: 0 }
};

if (fs.existsSync(file)) {
  try {
    data = { ...data, ...JSON.parse(fs.readFileSync(file, "utf8")) };
  } catch {
    console.log("Settings file could not be read. Using defaults.");
  }
}

function save() {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function menu() {
  console.log(`
===== WHATSAPP ULTIMATE MANAGER =====

1. Set Welcome Message
2. Set Goodbye Message
3. Set Group Rules
4. Add Auto Reply
5. Test Auto Reply
6. Test Message Filter
7. Add Warning
8. View Statistics
9. View All Settings
0. Exit
`);

  const choice = await ask("Choose option: ");

  switch (choice) {
    case "1":
      data.welcome = await ask("Enter welcome message: ");
      save();
      console.log("Welcome message saved!");
      break;

    case "2":
      data.goodbye = await ask("Enter goodbye message: ");
      save();
      console.log("Goodbye message saved!");
      break;

    case "3":
      data.rules = await ask("Enter group rules: ");
      save();
      console.log("Group rules saved!");
      break;

    case "4": {
      const q = await ask("Enter a keyword: ");
      const a = await ask("Enter its reply: ");
      if (q.trim()) {
        data.replies[q.toLowerCase()] = a;
        save();
        console.log("Auto reply saved!");
      }
      break;
    }

    case "5": {
      const msg = (await ask("Enter test message: ")).toLowerCase();
      const match = Object.keys(data.replies).find(k => msg.includes(k));
      console.log(match ? data.replies[match] : "No matching reply.");
      break;
    }

    case "6": {
      const msg = await ask("Enter message to test: ");
      data.stats.checked++;

      if (/https?:\/\/|www\./i.test(msg)) {
        data.stats.links++;
        console.log("Link detected! Demo warning.");
      } else if (/(.)\1{7,}/i.test(msg)) {
        data.stats.spam++;
        console.log("Possible spam detected!");
      } else {
        console.log("No test filter triggered.");
      }

      save();
      break;
    }

    case "7": {
      const user = await ask("Enter member nickname: ");
      if (user.trim()) {
        data.warnings[user] = (data.warnings[user] || 0) + 1;
        save();
        console.log("Warnings:", data.warnings[user]);
      }
      break;
    }

    case "8":
      console.log("Messages checked:", data.stats.checked);
      console.log("Links detected:", data.stats.links);
      console.log("Spam detected:", data.stats.spam);
      console.log("Warnings:", data.warnings);
      break;

    case "9":
      console.log(JSON.stringify(data, null, 2));
      break;

    case "0":
      console.log("Manager closed!");
      rl.close();
      return;

    default:
      console.log("Invalid option!");
  }

  await menu();
}

menu();
