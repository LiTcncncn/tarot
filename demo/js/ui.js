// ... existing code ...

    console.log(`周历渲染完成: 创建了 ${buttonsCreated} 个按钮，网格子元素数量: ${grid.children.length}，网格显示: ${window.getComputedStyle(grid).display}`);
    
    // 强制刷新样式
    void grid.offsetHeight;
    
    // 再次确保网格可见
    if (grid.children.length === 0) {
        console.error('警告：周历渲染后没有子元素！');
    } else {
        console.log('周历渲染成功，第一个按钮:', grid.children[0]);
    }
}

// 绑定周历滑动事件（仅移动端）
function bindWeeklyCalendarSwipe(container) {
    if (!container || window.innerWidth >= 1330) {
        // 桌面端不需要滑动
        return;
    }
    
    // 避免重复绑定
    if (container.dataset.swipeBound === 'true') {
        return;
    }
    container.dataset.swipeBound = 'true';
    
    let touchStartX = 0;
    let touchEndX = 0;
    let isSwiping = false;
    
    container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        isSwiping = false;
    }, { passive: true });
    
    container.addEventListener('touchmove', (e) => {
        isSwiping = true;
    }, { passive: true });
    
    container.addEventListener('touchend', (e) => {
        if (!isSwiping) return;
        
        touchEndX = e.changedTouches[0].screenX;
        const diffX = touchStartX - touchEndX;
        const minSwipeDistance = 50; // 最小滑动距离
        
        if (Math.abs(diffX) > minSwipeDistance) {
            if (diffX > 0) {
                // 向左滑动，显示下一周
                weeklyCalendarOffset++;
                console.log('向左滑动，显示下一周，偏移:', weeklyCalendarOffset);
            } else {
                // 向右滑动，显示上一周
                weeklyCalendarOffset--;
                console.log('向右滑动，显示上一周，偏移:', weeklyCalendarOffset);
            }
            
            // 重新渲染周历
            renderWeeklyCalendar();
        }
    }, { passive: true });
}

// 重置周历到本周
function resetWeeklyCalendar() {
    weeklyCalendarOffset = 0;
    // 清除滑动绑定标记，允许重新绑定
    document.querySelectorAll('.weekly-calendar-container').forEach(container => {
        container.dataset.swipeBound = 'false';
    });
    renderWeeklyCalendar();
}
