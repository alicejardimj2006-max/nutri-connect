const https = require("https");
const fs = require("fs");
const path = require("path");

const images = [
  {
    url: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1600&auto=format&fit=crop",
    dest: "public/images/hero/kitchen-prep.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200&auto=format&fit=crop",
    dest: "public/images/recipes/roasted-veg.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1517686469429-8bea8b02bd15?q=80&w=1200&auto=format&fit=crop",
    dest: "public/images/recipes/oatmeal.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1466637574689-1055d060cbd2?q=80&w=1200&auto=format&fit=crop",
    dest: "public/images/themes/fresh-ingredients.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=1200&auto=format&fit=crop",
    dest: "public/images/communities/friends-dinner.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop",
    dest: "public/images/challenges/salad-bowl.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200&auto=format&fit=crop",
    dest: "public/images/experiences/cooking.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",
    dest: "public/images/professionals/prof-1.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
    dest: "public/images/professionals/prof-2.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800&auto=format&fit=crop",
    dest: "public/images/professionals/prof-3.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=1200&auto=format&fit=crop",
    dest: "public/images/recipes/default-recipe.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1200&auto=format&fit=crop",
    dest: "public/images/experiences/default-experience.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1200&auto=format&fit=crop",
    dest: "public/images/hero/hero-table.jpg",
  },
];

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return download(res.headers.location, dest).then(resolve).catch(reject);
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          console.log("Downloaded", dest);
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

async function run() {
  for (const img of images) {
    try {
      await download(img.url, img.dest);
    } catch (e) {
      console.error("Error downloading", img.url, e);
    }
  }
}

run();
