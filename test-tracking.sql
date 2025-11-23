-- اختبار نظام التتبع
-- قم بتشغيل هذه الاستعلامات في Neon Console لفحص البيانات

-- 1. عرض جميع جلسات المشاهدة
SELECT 
    vws.id as session_id,
    vws.student_id,
    vws.video_id,
    vws.max_progress,
    vws.is_completed,
    vws.session_start,
    vws.session_end,
    vws.duration_seconds
FROM video_watch_sessions vws
ORDER BY vws.created_at DESC
LIMIT 10;

-- 2. عرض سجلات التتبع
SELECT 
    vwt.student_id,
    vwt.video_id,
    vwt.watch_count,
    vwt.completed_count,
    vwt.last_watch_progress,
    vwt.last_watched_at,
    vwt.created_at,
    vwt.updated_at
FROM video_watch_tracking vwt
ORDER BY vwt.updated_at DESC
LIMIT 10;

-- 3. عرض معلومات الفيديوهات مع حدود المشاهدة
SELECT 
    v.id,
    v.title,
    v.max_watch_count,
    v.watch_limit_enabled,
    vwt.completed_count,
    vwt.last_watch_progress,
    CASE 
        WHEN NOT v.watch_limit_enabled THEN 'غير محدود'
        WHEN vwt.completed_count IS NULL THEN CONCAT(v.max_watch_count, ' متاحة')
        WHEN vwt.completed_count >= v.max_watch_count THEN 'انتهت المشاهدات'
        ELSE CONCAT(v.max_watch_count - vwt.completed_count, ' متبقية')
    END as status
FROM videos v
LEFT JOIN video_watch_tracking vwt ON vwt.video_id = v.id
WHERE v.watch_limit_enabled = true
ORDER BY v.created_at DESC
LIMIT 10;

-- 4. تحليل مشكلة عدم الحفظ
-- استبدل STUDENT_ID و VIDEO_ID بالقيم الفعلية
SELECT 
    'Sessions' as table_name,
    COUNT(*) as record_count,
    MAX(max_progress) as max_progress,
    SUM(CASE WHEN is_completed THEN 1 ELSE 0 END) as completed_sessions
FROM video_watch_sessions
WHERE student_id = 'STUDENT_ID' AND video_id = 'VIDEO_ID'
UNION ALL
SELECT 
    'Tracking' as table_name,
    COUNT(*) as record_count,
    MAX(last_watch_progress) as max_progress,
    MAX(completed_count) as completed_sessions
FROM video_watch_tracking
WHERE student_id = 'STUDENT_ID' AND video_id = 'VIDEO_ID';

-- 5. إعادة تعيين البيانات للاختبار (احذر!)
-- استبدل STUDENT_ID و VIDEO_ID بالقيم الفعلية
/*
DELETE FROM video_watch_sessions 
WHERE student_id = 'STUDENT_ID' AND video_id = 'VIDEO_ID';

DELETE FROM video_watch_tracking 
WHERE student_id = 'STUDENT_ID' AND video_id = 'VIDEO_ID';
*/
