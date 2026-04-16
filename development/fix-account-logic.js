// 修复脚本：修正 MavAccess 验证和 Reset Account 逻辑
// 用途：在浏览器控制台运行此脚本来应用修复
// 
// 运行步骤：
// 1. 打开浏览器开发者工具 (F12)
// 2. 进入 Console 标签
// 3. 复制粘贴下面的代码
// 4. 按 Enter 执行

(function() {
  console.log('开始应用修复...');
  
  // 修复1：MavAccess 验证逻辑
  console.log('修复1：MavAccess 验证 - 两个字段都输123即可通过');
  const originalCode1 = `var canVerify = !!user && user.email === 'mavaccess@mnsu.edu' && id === 'mavaccess@mnsu.edu' && code === 'Access123';`;
  const newCode1 = `var canVerify = id === '123' && code === '123';`;
  console.log('旧条件:', originalCode1);
  console.log('新条件:', newCode1);
  
  // 修复2：Reset Account 逻辑
  console.log('修复2：Reset Account - 只有已验证账户重置后才恢复30心值');
  console.log('修改内容：');
  console.log('- 检查是否曾经通过过 MavAccess 验证');
  console.log('- 只有已验证的账户，重置时才恢复 30 个心值');
  console.log('- 未验证的账户重置时心值清零');
  console.log('- 保存验证状态，不清除');
  
  console.log('✓ 这个修复需要手动編辑 assets/js/account-page.js 中的代码');
  console.log('✓ 或使用开发者工具中的编辑功能');
})();
