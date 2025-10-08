import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";

const git = simpleGit();
const path = "./data.json";

// GitHub author details (must match your GitHub account)
const GIT_AUTHOR_NAME = "iamzaife";
const GIT_AUTHOR_EMAIL = "iamzee64@gmail.com";// or your no-reply email

// Smarter commit count based on day
function getRandomCommitCount(date) {
  const isWeekend = date.day() === 0 || date.day() === 6;
  const roll = Math.random();

  if (isWeekend) {
    if (roll < 0.7) return 0;
    return Math.floor(Math.random() * 3); // 0–2
  } else {
    if (roll < 0.2) return 0;
    if (roll < 0.5) return Math.floor(Math.random() * 3) + 1; // 1–3
    if (roll < 0.8) return Math.floor(Math.random() * 5) + 3; // 3–7
    return Math.floor(Math.random() * 4) + 8; // 8–11
  }
}

async function fillMissing2024Commits() {
  const startDate = moment("2024-01-01");
  const endDate = moment("2024-09-30");
  let currentDate = startDate.clone();

  while (currentDate.isSameOrBefore(endDate)) {
    const commitsToday = getRandomCommitCount(currentDate);

    for (let i = 0; i < commitsToday; i++) {
      const dateString = currentDate.format();
      const data = { date: dateString, commit: i };

      try {
        await jsonfile.writeFile(path, data);
        await git.add(path);

        const offsetSeconds = i * 60;
        const commitDate = currentDate.clone().add(offsetSeconds, 'seconds').format();

        await git.commit(`Backfill commit #${i + 1} on ${dateString}`, undefined, {
          "--date": commitDate,
          "--author": `"${GIT_AUTHOR_NAME} <${GIT_AUTHOR_EMAIL}>"`,
        });

        console.log(`✅ ${dateString}: Commit ${i + 1} of ${commitsToday}`);
      } catch (err) {
        console.error(`❌ Error on ${dateString}:`, err);
      }
    }

    currentDate.add(1, "day");
  }

  try {
    await git.push();
    console.log("✅ All missing 2024 commits pushed to GitHub.");
  } catch (err) {
    console.error("❌ Push failed:", err);
  }
}

fillMissing2024Commits();
