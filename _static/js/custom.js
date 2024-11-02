document.addEventListener("DOMContentLoaded", function () {
    // 查找所有 .toctree-l1 的 <a> 标签
    document.querySelectorAll(".toctree-l1 > a").forEach(function (link) {
        let href = link.getAttribute("href");  // 获取 href 属性
        
        if (href && href.length >= 13) { // 确保 href 至少包含 13 个字符
            let dateString = href.slice(5, 13);  // 提取索引 5 到 13 的日期字符串
            
            // 格式化日期字符串为 "YYYY/MM/DD"
            let formattedDate = `${dateString.slice(0, 4)}/${dateString.slice(4, 6)}/${dateString.slice(6, 8)}`;
            
            // 创建 <span> 元素并添加日期前缀
            let datePrefix = document.createElement("span");
            datePrefix.innerHTML = `<strong>${formattedDate}</strong> - `;
            
            // 将日期前缀插入到链接之前
            link.parentNode.insertBefore(datePrefix, link);
        }
    });
});
