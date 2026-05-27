// debug.js

// Mock ObjectIds (as Mongoose ObjectIds)
const rawIds = [
  ("687103c758a4a23bbfe7b248"),
  ("687103c758a4a23bbfe7b249"),
  ("687103c758a4a23bbfe7b250")
];

// ID you want to check
const toId = "687103c758a4a23bbfe7b248";

// Convert all ObjectIds to string before creating Set
const followingSet = new Set(rawIds.map(id => id.toString()));

console.log("🧾 Following Set:", followingSet);
console.log("🔍 Target ID:", toId);

// Check if following
const isFollowing = followingSet.has(toId.toString());
console.log("✅ Is Following:", isFollowing);


                <div>
                  {user && user._id === data.author._id ? 
                    <Button>{item.auther && item.label}</Button> 
                    : 
                    <Button>{!item.auther && item.label}</Button>
                  }
                </div>



// 2678dd231fdd34457be5cb271e3788f9