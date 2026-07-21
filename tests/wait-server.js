const check = async () => {
  try {
    await Promise.all([
      fetch('http://localhost:8787/users/list'),
      fetch('http://localhost:8788/stores'),
      fetch('http://localhost:8789/my-stores')
    ]);
    console.log("All local Wrangler (Rust) servers ready.");
    process.exit(0);
  } catch (e) {
    setTimeout(check, 500);
  }
};
check();
