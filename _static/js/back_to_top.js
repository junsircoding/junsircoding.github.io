document.addEventListener('DOMContentLoaded', function () {
    // 创建按钮元素
    var button = document.createElement('button');
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.zIndex = '1000';
    button.style.display = 'none';  // 初始状态为隐藏
    button.style.padding = '0';
    button.style.border = 'none';
    button.style.backgroundColor = 'transparent';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.0)';
    
    // 直接创建 SVG
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 1024 1024");
    svg.setAttribute("width", "40");
    svg.setAttribute("height", "40");
    svg.setAttribute("class", "icon");
    svg.innerHTML = `
        <style>
            .icon {
                transition: transform 0.1s ease;
                cursor: pointer;
            }
            .icon:active {
                transform: scale(0.9);
            }
        </style>
        <circle cx="512" cy="512" r="512" fill="#B6D2FF" fill-opacity="0.28"/>
        <path d="M702.0416 268.8H334.8608C319.616 268.8 307.2 280.3072 307.2 294.4s12.416 25.6 27.648 25.6h367.104c15.232 0 27.648-11.5072 27.648-25.6s-12.416-25.6-27.5584-25.6z m-170.752 97.28a26.9184 26.9184 0 0 0-15.1296-7.488h-0.1024c-0.3968-0.0896-0.7936-0.0896-1.088-0.0896h-0.2944c-0.3072 0-0.6912-0.1024-0.9984-0.1024h-3.5584c-0.2944 0-0.6912 0-0.9856 0.1024h-0.2944c-0.3968 0-0.7936 0.0896-1.088 0.0896h-0.1024c-5.5424 0.8832-10.88 3.3024-15.1296 7.488L327.936 527.9744a26.5856 26.5856 0 0 0 0 37.888 27.7504 27.7504 0 0 0 38.5792 0l118.1824-116.1216v291.4432c0 14.7712 12.2624 26.816 27.3024 26.816s27.3024-12.0448 27.3024-26.816V449.6512l118.1824 116.1216a27.7504 27.7504 0 0 0 38.5792 0 26.5856 26.5856 0 0 0 0-37.888L531.2896 366.08z" fill="#337DFF"></path>
    `;

    
    // 将SVG图标添加到按钮中
    button.appendChild(svg);
    document.body.appendChild(button);

    // 监听滚动事件，显示按钮
    window.addEventListener('scroll', function () {
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            button.style.display = 'block';  // 滚动超过100px时显示按钮
        } else {
            button.style.display = 'none';  // 否则隐藏
        }
    });

    // 监听按钮点击事件，平滑滚动到顶部
    button.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'  // 平滑滚动
        });
    });
});
