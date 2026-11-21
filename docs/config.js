// ตั้งค่าหน้าเว็บ — scripts/deploy.js จะอัปเดต CONTRACT_ADDRESS / CHAIN_ID / DEPLOY_BLOCK ให้อัตโนมัติ
// ถ้า deploy ผ่าน Remix ให้แก้ค่าเหล่านี้เอง
window.APP_CONFIG = {
  CONTRACT_ADDRESS: "0x29eb566f11c30e918FcE9aa81c1a786C6568004c",
  CHAIN_ID: 11155111, // 11155111 = Sepolia, 31337 = Hardhat local
  DEPLOY_BLOCK: 12139740, // block ที่ deploy (ช่วยให้โหลดประวัติเร็วขึ้น)
  NETWORKS: {
    11155111: { name: "Sepolia", rpc: "https://ethereum-sepolia-rpc.publicnode.com", explorer: "https://sepolia.etherscan.io", symbol: "SepoliaETH" },
    31337: { name: "Hardhat Local", rpc: "http://127.0.0.1:8545", explorer: "", symbol: "ETH" },
  },
};
