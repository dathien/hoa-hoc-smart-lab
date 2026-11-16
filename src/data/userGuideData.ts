export interface GuideStep {
  title: string;
  detail: string;
  buttons?: string[];
}

export interface GuideTroubleshooting {
  issue: string;
  cause: string;
  solution: string;
}

export interface GuideTargetRoute {
  tab: string;
  sub?: string;
  routeLabel: string;
  teacherOnly?: boolean;
}

export interface GuideChapter {
  id: string;
  chapterNumber: number;
  title: string;
  shortTitle: string;
  roles: ('Giáo viên' | 'Học sinh' | 'Phụ huynh' | 'Quản trị viên')[];
  purpose: string;
  menuLocation: string;
  prerequisites: string[];
  steps: GuideStep[];
  example: {
    title: string;
    scenario: string;
    outcome: string;
  };
  expectedResult: string;
  troubleshooting: GuideTroubleshooting[];
  targetRoute: GuideTargetRoute;
}

export interface GuideRoleSection {
  id: 'teacher' | 'student' | 'parent' | 'admin';
  roleName: string;
  subtitle: string;
  summary: string;
  dailyWorkflow: string[];
  recommendedChapters: string[];
  quickSwitchNote: string;
}

export interface GuideWorkedExample {
  id: string;
  order: number;
  title: string;
  category: string;
  chapterId: string;
  goal: string;
  steps: string[];
  expectedOutcome: string;
  targetRoute: GuideTargetRoute;
}

export interface GuideFaqItem {
  id: string;
  question: string;
  answer: string;
  relatedChapterId?: string;
}

export const QUICK_START_STEPS: {
  stepNumber: number;
  title: string;
  description: string;
  actionHint: string;
}[] = [
  {
    stepNumber: 1,
    title: 'Chọn đúng vai trò sử dụng ở góc trên bên phải',
    description:
      'Tại thanh đầu trang phía trên, nhấn vào khung tên tài khoản đang đăng nhập để chuyển giữa Giáo viên Hóa học, Học sinh, Phụ huynh hoặc Tổ trưởng Chuyên môn / Quản trị viên.',
    actionHint: 'Thanh đầu trang → Nút chuyển đổi vai trò',
  },
  {
    stepNumber: 2,
    title: 'Điều hướng bằng 8 nhóm chức năng bên thanh trái',
    description:
      'Cổng Giáo viên tổ chức gọn trong 8 mục chính: Tổng quan, Lớp học & Học sinh, Học liệu & Kế hoạch, Bài tập & Kiểm tra, Phòng thực hành 2D/3D, Flashcard Hóa học, Kết quả & Phụ huynh và Quản trị hệ thống. Có thể nhấn nút thu gọn ở đầu thanh bên để mở rộng vùng làm việc.',
    actionHint: 'Thanh bên trái → Nhấp nhóm chức năng → Chọn mục con',
  },
  {
    stepNumber: 3,
    title: 'Thực hành ngay bằng các chức năng trực quan',
    description:
      'Mở Bảng tuần hoàn 118 nguyên tố, Phòng thí nghiệm ảo 2D/3D hoặc Flashcard Hóa học để giảng dạy trực tiếp. Khi soạn câu hỏi hoặc phiếu học tập, dùng Trình soạn thảo Hóa học thông minh để chèn công thức, ion, phương trình phản ứng và cấu tạo hữu cơ 2D.',
    actionHint: 'Học liệu & Kế hoạch / Phòng thực hành 2D/3D / Bài tập & Kiểm tra',
  },
  {
    stepNumber: 4,
    title: 'Tra cứu hướng dẫn mọi lúc mà không mất dữ liệu đang nhập',
    description:
      'Bất cứ khi nào cần xem lại thao tác, nhấn nút Hướng dẫn sử dụng ở thanh đầu trang hoặc nút Hướng dẫn ngay trong từng phân hệ. Hệ thống giữ nguyên toàn bộ nội dung đang soạn dở để bạn quay lại làm việc ngay lập tức.',
    actionHint: 'Nút Hướng dẫn sử dụng → Xem hướng dẫn → Quay lại chức năng đang sử dụng',
  },
];

export const ROLE_GUIDES: GuideRoleSection[] = [
  {
    id: 'teacher',
    roleName: 'Giáo viên',
    subtitle: 'Quản lý lớp học, soạn giảng, lập ma trận – tạo đề, chấm bài và liên hệ phụ huynh',
    summary:
      'Giáo viên có toàn quyền trên 8 phân hệ giảng dạy: quản lý hồ sơ 108 học sinh của 3 lớp 10A1, 11A1, 12A1; soạn bài giảng & phiếu học tập; xây dựng ma trận – bản đặc tả – ngân hàng câu hỏi – trộn mã đề; tổ chức thí nghiệm ảo 2D/3D; chấm bài tự luận và quyết định thời điểm công bố điểm.',
    dailyWorkflow: [
      'Kiểm tra nhanh mục Tổng quan để xem số bài nộp cần chấm (NEEDS_REVIEW) và các đề đang mở.',
      'Vào Lớp học & Học sinh khi cần cập nhật danh sách, thêm học sinh mới, chuyển lớp hoặc xuất Excel.',
      'Vào Học liệu & Kế hoạch để mở Bảng tuần hoàn 118, Mô hình Nguyên tử/Phân tử 3D, Bách khoa Hóa học và Kế hoạch dạy học.',
      'Vào Bài tập & Kiểm tra thực hiện quy trình 7 bước: Ma trận & Bản đặc tả → Ngân hàng câu hỏi → Tạo đề mới → Trộn đề & Mã đề → Đáp án & Hướng dẫn chấm → Đề đã lưu & Giao bài.',
      'Vào Kết quả & Phụ huynh để rà soát điểm cuối cùng, nhấn Công bố điểm và sao chép tin nhắn Zalo 150 ký tự gửi phụ huynh.',
    ],
    recommendedChapters: ['ch2-classes', 'ch6-matrix', 'ch7-question-shuffle', 'ch8-editor', 'ch9-lab2d3d'],
    quickSwitchNote: 'Vai trò mặc định khi mở hệ thống là Cô Trần Thị Mai Hương (Giáo viên Hóa học).',
  },
  {
    id: 'student',
    roleName: 'Học sinh',
    subtitle: 'Tự học 3D, ôn tập Flashcard, thực hành thí nghiệm ảo và làm bài kiểm tra trực tuyến',
    summary:
      'Học sinh sử dụng giao diện tinh gọn gồm Tổng quan, Học liệu & Bài học, Bài tập & Kiểm tra, Phòng thực hành 2D/3D, Flashcard Hóa học, Tiến độ & Kết quả và Hồ sơ cá nhân.',
    dailyWorkflow: [
      'Tại Tổng quan học sinh, nhấn Làm bài kiểm tra ngay hoặc chọn nhanh Bảng tuần hoàn 118, Flashcard 3D hay Phòng thực hành 2D/3D.',
      'Vào Bài tập & Kiểm tra, chọn đề đang mở phù hợp với lớp của mình để hệ thống phát mã đề riêng (ví dụ mã 101, 102...), chọn đáp án ở 4 phần và nhấn Nộp bài.',
      'Vào Phòng thực hành 2D/3D để tự pha hóa chất, quan sát kết tủa/sủi bọt khí, chuyển góc nhìn 2D/3D và thử cân bằng phương trình hóa học.',
      'Vào Flashcard Hóa học để lật mặt sau xem tính chất hóa học, xoay phân tử 3D 360° và chơi Bí kíp Dãy Hoạt Động để ghi nhớ thứ tự kim loại.',
    ],
    recommendedChapters: ['ch4-periodic', 'ch9-lab2d3d', 'ch10-sims', 'ch11-flashcard', 'ch12-results-parents'],
    quickSwitchNote: 'Có thể chuyển sang tài khoản Nguyễn Minh Khang (Lớp 11A1 – HS11015) để kiểm tra trải nghiệm học sinh.',
  },
  {
    id: 'parent',
    roleName: 'Phụ huynh',
    subtitle: 'Theo dõi kết quả học tập chính thức đã công bố và thông báo từ giáo viên',
    summary:
      'Cổng Phụ huynh được thiết kế đơn giản, minh bạch và tuân thủ nguyên tắc bảo mật điểm số: chỉ hiển thị điểm các bài kiểm tra sau khi giáo viên bộ môn chính thức công bố.',
    dailyWorkflow: [
      'Kiểm tra thông tin liên kết chính chủ của con ở khung trên cùng (Họ tên, Mã học sinh, Lớp học, GVCN).',
      'Xem 3 thẻ thống kê nhanh: Số bài đã công bố điểm & điểm trung bình, Số bài đang chờ giáo viên chấm, Đánh giá chuyên cần.',
      'Đọc nhận xét chi tiết của giáo viên bên dưới từng bài kiểm tra trong mục Bảng Điểm Kiểm Tra Chính Thức Của Con.',
      'Theo dõi các thông báo nhắc nhở học tập từ giáo viên chủ nhiệm ở khung Thông Báo Từ Giáo Viên.',
    ],
    recommendedChapters: ['ch12-results-parents', 'ch14-errors'],
    quickSwitchNote: 'Chuyển sang tài khoản Phụ huynh em Nguyễn Minh Khang để kiểm tra góc nhìn phụ huynh.',
  },
  {
    id: 'admin',
    roleName: 'Quản trị viên',
    subtitle: 'Thẩm định kế hoạch tổ chuyên môn, kiểm soát quy tắc bảo mật và sao lưu dữ liệu',
    summary:
      'Quản trị viên và Tổ trưởng Chuyên môn theo dõi tình trạng thẩm định kế hoạch dạy học chuẩn GDPT 2018, kiểm tra số lượng học sinh phân bổ theo lớp và thực hiện khôi phục dữ liệu mẫu khi cần thiết.',
    dailyWorkflow: [
      'Vào Quản trị hệ thống → Chuyên môn Tổ Hóa để xem trạng thái phê duyệt kế hoạch dạy học và ngân hàng đề thi.',
      'Vào Quản trị hệ thống → Cài đặt & Dữ liệu để kiểm tra phân bổ 108 học sinh trên 3 lớp 10A1, 11A1, 12A1 và quy tắc bảo mật chấm điểm.',
      'Chỉ nhấn Khôi phục dữ liệu mẫu ban đầu khi muốn đưa toàn bộ dữ liệu thử nghiệm về trạng thái chuẩn ban đầu (sẽ có hộp thoại xác nhận).',
    ],
    recommendedChapters: ['ch13-admin', 'ch2-classes', 'ch14-errors'],
    quickSwitchNote: 'Chuyển sang vai trò Tổ trưởng Chuyên môn hoặc Quản trị viên để xem toàn quyền quản trị.',
  },
];

export const GUIDE_CHAPTERS: GuideChapter[] = [
  {
    id: 'ch1-start',
    chapterNumber: 1,
    title: 'CHƯƠNG 1: Bắt đầu sử dụng',
    shortTitle: 'Bắt đầu sử dụng',
    roles: ['Giáo viên', 'Học sinh', 'Phụ huynh', 'Quản trị viên'],
    purpose:
      'Giúp người dùng làm quen tổng thể giao diện CHEMISTRY EDU PRO, hiểu cách chuyển đổi vai trò, đọc số liệu nhanh ở màn hình Tổng quan và mở đúng chức năng cần làm việc chỉ trong vài giây.',
    menuLocation: 'Thanh đầu trang + Thanh bên trái → Tổng quan',
    prerequisites: [
      'Mở ứng dụng trên trình duyệt web hiện đại (Chrome, Edge, Firefox hoặc Safari).',
      'Màn hình có độ phân giải từ điện thoại đến máy tính để bàn.',
    ],
    steps: [
      {
        title: 'Nhận diện thanh đầu trang và khu vực làm việc',
        detail:
          'Phía trên cùng là logo CHEMISTRY EDU PRO, nút Hướng dẫn sử dụng, biểu tượng chuông Thông báo và nút chọn tài khoản/vai trò. Bên trái là thanh điều hướng 8 nhóm chức năng (trên điện thoại nhấn biểu tượng 3 gạch để mở).',
        buttons: ['Hướng dẫn sử dụng', 'Thông báo', 'Chuyển đổi vai trò kiểm thử'],
      },
      {
        title: 'Chuyển đổi vai trò khi cần giảng dạy hoặc kiểm thử',
        detail:
          'Nhấn vào khung tên người dùng ở góc phải thanh đầu trang, sau đó chọn Giáo viên Hóa học, Học sinh hoặc Phụ huynh. Thanh bên trái sẽ tự động điều chỉnh đúng quyền hạn của vai trò vừa chọn.',
        buttons: ['Giáo viên Hóa học', 'Học sinh', 'Phụ huynh'],
      },
      {
        title: 'Xem bảng điều khiển Tổng quan',
        detail:
          'Tại mục Tổng quan, quan sát 4 thẻ số liệu nhanh: Tổng số học sinh (108), Đề kiểm tra đang mở, Bài chờ GV chấm và Điểm đã công bố. Nhấn trực tiếp vào bất kỳ thẻ nào hoặc nút Chấm bài & duyệt điểm ngay để đi thẳng tới công việc.',
        buttons: ['Chấm bài & duyệt điểm ngay'],
      },
      {
        title: 'Thu gọn thanh bên để tăng diện tích trình chiếu',
        detail:
          'Khi dạy học trên máy chiếu hoặc bảng tương tác, nhấn biểu tượng Thu gọn thanh điều hướng ở góc trên thanh bên trái để thu gọn chỉ còn các biểu tượng.',
        buttons: ['Thu gọn thanh điều hướng'],
      },
    ],
    example: {
      title: 'Khởi động đầu giờ dạy Hóa học lớp 11A1',
      scenario:
        'Giáo viên mở CHEMISTRY EDU PRO, kiểm tra nhanh ở Tổng quan xem có bao nhiêu bài kiểm tra đang chờ duyệt điểm, rồi thu gọn thanh bên trái trước khi chiếu thí nghiệm cho cả lớp.',
      outcome:
        'Nắm ngay danh sách việc cần xử lý trong ngày và có vùng hiển thị rộng rãi, rõ chữ trên màn hình lớp học.',
    },
    expectedResult:
      'Giao diện hiển thị đúng vai trò mong muốn, không mất dữ liệu đang lưu trên trình duyệt và chuyển mượt giữa các mục.',
    troubleshooting: [
      {
        issue: 'Không thấy đầy đủ 8 mục chức năng trên thanh bên trái.',
        cause: 'Bạn đang chọn vai trò Học sinh hoặc Phụ huynh thay vì Giáo viên.',
        solution: 'Nhấn vào tên người dùng ở góc trên phải thanh đầu trang và chọn lại Giáo viên Hóa học.',
      },
      {
        issue: 'Trên điện thoại không thấy thanh menu bên trái.',
        cause: 'Thanh menu tự động ẩn gọn trên màn hình nhỏ.',
        solution: 'Nhấn vào biểu tượng nút 3 gạch ngang ở góc trên bên trái thanh đầu trang để mở menu.',
      },
    ],
    targetRoute: {
      tab: 'overview',
      routeLabel: 'Tổng quan',
    },
  },
  {
    id: 'ch2-classes',
    chapterNumber: 2,
    title: 'CHƯƠNG 2: Lớp học & Học sinh',
    shortTitle: 'Lớp học & Học sinh',
    roles: ['Giáo viên', 'Quản trị viên'],
    purpose:
      'Quản lý tập trung toàn bộ hồ sơ học sinh theo 3 lớp chuẩn (10A1: 30 HS, 11A1: 39 HS, 12A1: 39 HS – tổng 108 HS), phân biệt học sinh trùng tên bằng mã định danh duy nhất (như HS11028 và HS11029), thêm/sửa/chuyển lớp và nhập/xuất danh sách CSV/Excel.',
    menuLocation: 'Thanh bên trái → Lớp học & Học sinh → Danh sách lớp & học sinh hoặc Lớp chủ nhiệm (11A1)',
    prerequisites: [
      'Đang sử dụng vai trò Giáo viên, Tổ trưởng Chuyên môn hoặc Quản trị viên.',
    ],
    steps: [
      {
        title: 'Chọn lớp cần xem hoặc chuyển sang tab Lớp Chủ Nhiệm',
        detail:
          'Nhấn trực tiếp vào thẻ Lớp 10A1, Lớp 11A1 hoặc Lớp 12A1 phía trên bảng để lọc nhanh sĩ số lớp đó. Nhấn tab con Lớp Chủ Nhiệm (11A1) để xem khung thông tin GVCN và sĩ số chuyên cần.',
        buttons: ['Quản lý Lớp học & Học sinh', 'Lớp Chủ Nhiệm (11A1)', 'Xem toàn trường'],
      },
      {
        title: 'Tìm kiếm và lọc học sinh',
        detail:
          'Gõ họ tên hoặc mã học sinh (ví dụ HS11028 hoặc Tường Vy) vào ô tìm kiếm, kết hợp bộ lọc Giới tính và Lớp học để tra cứu nhanh.',
        buttons: ['Tất cả các lớp (108 HS)', 'Tất cả giới tính'],
      },
      {
        title: 'Thêm học sinh mới hoặc chỉnh sửa / chuyển lớp',
        detail:
          'Nhấn nút Thêm học sinh, điền Họ tên, Mã học sinh, chọn Lớp, Giới tính, Ngày sinh và SĐT phụ huynh rồi bấm Lưu. Trên từng dòng học sinh, dùng biểu tượng Bút chì (Sửa), hai mũi tên (Chuyển lớp) hoặc Thùng rác (Xóa).',
        buttons: ['Thêm học sinh'],
      },
      {
        title: 'Nhập hàng loạt hoặc xuất file Excel / CSV',
        detail:
          'Nhấn Excel mẫu để tải file cấu trúc chuẩn. Nhấn Nhập Excel, dán dữ liệu hoặc chọn file CSV rồi xác nhận. Nhấn Xuất Excel để tải danh sách đang lọc về máy.',
        buttons: ['Excel mẫu', 'Nhập Excel', 'Xuất Excel'],
      },
    ],
    example: {
      title: 'Phân biệt hai học sinh trùng tên tại lớp 11A1 và thêm học sinh chuyển đến',
      scenario:
        'Giáo viên lọc Lớp 11A1, gõ "Tường Vy" vào ô tìm kiếm để kiểm tra riêng em Phạm Ngọc Tường Vy (HS11028) và Phạm Ngọc Tường Vy (HS11029), sau đó nhấn Thêm học sinh để bổ sung 1 học sinh mới nhập học vào lớp 11A1.',
      outcome:
        'Hai hồ sơ trùng tên vẫn tách bạch hoàn toàn theo mã học sinh; sĩ số lớp 11A1 cập nhật ngay từ 39 lên 40 học sinh.',
    },
    expectedResult:
      'Danh sách học sinh hiển thị chính xác sĩ số từng lớp, không trùng khóa và đồng bộ tức thì sang phần chấm điểm, giao bài và nhắn tin phụ huynh.',
    troubleshooting: [
      {
        issue: 'Nhập Excel báo lỗi thiếu cột hoặc bỏ qua dòng dữ liệu.',
        cause: 'Thứ tự cột chưa khớp mẫu: Mã HS, Họ và tên, Lớp, Giới tính, Ngày sinh.',
        solution: 'Nhấn nút Excel mẫu để tải đúng tệp mẫu chuẩn, điền dữ liệu theo cột đó rồi thực hiện lại Nhập Excel.',
      },
      {
        issue: 'Không thấy học sinh vừa thêm trong bảng.',
        cause: 'Bộ lọc lớp hoặc ô tìm kiếm vẫn đang lọc lớp khác hoặc từ khóa cũ.',
        solution: 'Nhấn Xem toàn trường hoặc xóa trắng ô tìm kiếm.',
      },
    ],
    targetRoute: {
      tab: 'classes',
      sub: 'class-list',
      routeLabel: 'Lớp học & Học sinh',
      teacherOnly: true,
    },
  },
  {
    id: 'ch3-learning',
    chapterNumber: 3,
    title: 'CHƯƠNG 3: Học liệu & Kế hoạch',
    shortTitle: 'Học liệu & Kế hoạch',
    roles: ['Giáo viên', 'Học sinh'],
    purpose:
      'Cung cấp kho bài học Hóa học 10–11–12 theo chương trình SGK Kết nối tri thức, tích hợp Trình soạn thảo Hóa học thông minh để soạn nội dung bài học, kế hoạch dạy học theo tuần/tiết, phiếu học tập xuất Word (.docx) và nhật ký học tập.',
    menuLocation:
      'Thanh bên trái → Học liệu & Kế hoạch → Học liệu Hóa học (SGK), Kế hoạch dạy học, Kế hoạch ôn tập, Nhật ký học tập',
    prerequisites: [
      'Chuẩn bị tên bài dạy, khối lớp (10, 11 hoặc 12), tuần và tiết theo phân phối chương trình.',
    ],
    steps: [
      {
        title: 'Mở kho Học liệu Hóa học (SGK)',
        detail:
          'Chọn Học liệu Hóa học (SGK) để xem bài giảng có sẵn theo từng khối lớp hoặc thêm/chỉnh sửa nội dung bài học bằng Trình soạn thảo Hóa học thông minh.',
        buttons: ['Học liệu Hóa học (SGK)'],
      },
      {
        title: 'Chuyển sang tab Kế hoạch dạy học và chọn khối lớp',
        detail:
          'Nhấn tab Kế hoạch dạy học, chọn khối Lớp 10, Lớp 11 hoặc Lớp 12 để xem danh sách bài dạy đã lập theo từng tuần học.',
        buttons: ['Kế hoạch dạy học'],
      },
      {
        title: 'Soạn mới hoặc sửa Kế hoạch dạy học & Phiếu học tập',
        detail:
          'Nhấn nút Thêm kế hoạch hoặc nút Chỉnh sửa trên một bài dạy có sẵn. Điền Mục tiêu bài dạy, Thiết bị, Nội dung Phiếu học tập (chèn công thức/phương trình ngay trong khung soạn thảo), sau đó nhấn Lưu kế hoạch.',
        buttons: ['Thêm kế hoạch', 'Chỉnh sửa', 'Lưu kế hoạch', 'Xuất phiếu học tập (.docx)'],
      },
      {
        title: 'Kết nối Kế hoạch ôn tập và Nhật ký học tập',
        detail:
          'Dùng tab Kế hoạch ôn tập để gắn bài tập/đề kiểm tra đã có vào lộ trình ôn luyện theo chủ đề, và mở Nhật ký học tập để theo dõi tự động lịch sử nộp bài, chấm điểm của học sinh.',
        buttons: ['Kế hoạch ôn tập', 'Nhật ký học tập'],
      },
    ],
    example: {
      title: 'Soạn và xuất Phiếu học tập bài "Cân bằng hóa học" lớp 11',
      scenario:
        'Giáo viên mở Kế hoạch dạy học → chọn Khối 11 → nhấn Chỉnh sửa bài Cân bằng hóa học → nhập phản ứng thuận nghịch tổng hợp NH₃ trong khung Phiếu học tập → nhấn Lưu và xuất file Word (.docx).',
      outcome:
        'Kế hoạch và phiếu học tập được lưu lại đồng bộ và tải về máy dưới dạng tệp .docx trình bày công thức hóa học chuẩn xác.',
    },
    expectedResult:
      'Bài giảng, kế hoạch dạy học và phiếu học tập có công thức rõ nét, xuất được sang tệp Word và đồng bộ vào quy trình ôn tập.',
    troubleshooting: [
      {
        issue: 'Xuất Word xong bị thiếu phần nội dung Phiếu học tập vừa gõ.',
        cause: 'Chưa nhấn Lưu kế hoạch trước khi bấm nút xuất file.',
        solution: 'Nhấn Lưu kế hoạch để cập nhật dữ liệu mới nhất rồi mới nhấn nút xuất .docx.',
      },
    ],
    targetRoute: {
      tab: 'learning',
      sub: 'lessons',
      routeLabel: 'Học liệu & Kế hoạch',
    },
  },
  {
    id: 'ch4-periodic',
    chapterNumber: 4,
    title: 'CHƯƠNG 4: Bảng tuần hoàn 118 nguyên tố',
    shortTitle: 'Bảng tuần hoàn 118',
    roles: ['Giáo viên', 'Học sinh'],
    purpose:
      'Tra cứu tương tác toàn bộ 118 nguyên tố hóa học (18 nhóm, 7 chu kỳ, họ Lanthanoid & Actinoid) theo dữ liệu IUPAC & NIST; so sánh xu hướng biến đổi tuần hoàn và mở liên kết sang mô hình nguyên tử 3D hoặc Bách khoa Hóa học.',
    menuLocation: 'Thanh bên trái → Học liệu & Kế hoạch → Bảng tuần hoàn 118 nguyên tố',
    prerequisites: [
      'Không yêu cầu cài đặt bổ sung; có thể thu phóng trực tiếp ngay trên trình duyệt.',
    ],
    steps: [
      {
        title: 'Tìm kiếm hoặc lọc theo phân loại nguyên tố',
        detail:
          'Gõ số hiệu Z, ký hiệu hóa học hoặc tên nguyên tố (ví dụ: Fe, 26, Oxi) vào ô tìm kiếm. Hoặc chọn danh mục ở ô Tất cả 118 nguyên tố (Kim loại kiềm, Halogen, Khí hiếm...).',
        buttons: ['Tất cả 118 nguyên tố'],
      },
      {
        title: 'Chuyển chế độ bản đồ nhiệt xu hướng tuần hoàn',
        detail:
          'Phía trên bảng có các chế độ hiển thị màu theo Phân loại nhóm chất, Bán kính nguyên tử, Độ âm điện, Năng lượng ion hóa hoặc Tính kim loại / phi kim.',
        buttons: ['Toàn màn hình', 'Phóng to', 'Thu nhỏ'],
      },
      {
        title: 'Nhấp chọn một ô nguyên tố để xem bảng chi tiết',
        detail:
          'Nhấp vào nguyên tố bất kỳ (ví dụ Na, Cl, Fe, Cu) để xem số hiệu Z, nguyên tử khối, độ âm điện, cấu hình electron phân lớp, số lớp K/L/M/N và số oxi hóa đặc trưng.',
      },
      {
        title: 'Mở liên thông sang Nguyên tử 3D hoặc Bách khoa',
        detail:
          'Trong thẻ chi tiết nguyên tố đang chọn, nhấn nút mở Mô hình nguyên tử 3D / Cấu hình e hoặc mở Bách khoa Hóa học để giảng sâu về nguyên tố đó.',
      },
    ],
    example: {
      title: 'So sánh độ âm điện từ F đến I và chiếu mô hình nguyên tử Natri (Z=11)',
      scenario:
        'Giáo viên bật chế độ Độ âm điện trên Bảng tuần hoàn, nhấn Toàn màn hình để học sinh quan sát màu đậm nhất tại Fluorine (3,98), sau đó nhấp vào ô Na (Z=11) và chuyển tiếp sang mô hình Nguyên tử 3D.',
      outcome:
        'Học sinh nhìn rõ quy luật giảm độ âm điện trong nhóm VIIA và quan sát trực tiếp 11 electron chuyển động trên 3 lớp K, L, M của Na.',
    },
    expectedResult:
      'Bảng tuần hoàn phản hồi tức thì khi tìm kiếm, thu phóng mượt mà không vỡ khung và giữ nguyên nguyên tố đang chọn khi chuyển sang mục Nguyên tử 3D.',
    troubleshooting: [
      {
        issue: 'Một số ô nguyên tố trông bị mờ đi.',
        cause: 'Bạn đang nhập từ khóa tìm kiếm hoặc chọn bộ lọc nhóm chất nên các nguyên tố không khớp được làm mờ để làm nổi bật kết quả.',
        solution: 'Nhấn nút Đặt lại góc nhìn (biểu tượng mũi tên xoay tròn cạnh thanh zoom) để hiện rõ toàn bộ 118 nguyên tố.',
      },
    ],
    targetRoute: {
      tab: 'learning',
      sub: 'periodic-table',
      routeLabel: 'Bảng tuần hoàn 118',
    },
  },
  {
    id: 'ch5-3d-encyclopedia',
    chapterNumber: 5,
    title: 'CHƯƠNG 5: Nguyên tử 3D, Phân tử 3D & Bách khoa Hóa học',
    shortTitle: '3D & Bách khoa Hóa học',
    roles: ['Giáo viên', 'Học sinh'],
    purpose:
      'Trực quan hóa cấu tạo vỏ electron (lớp và phân lớp K, L, M, N, orbital/cấu hình e), mô hình không gian phân tử 3D (góc liên kết, dạng hình học, lai hóa) và tra cứu nhanh kiến thức chuyên đề trong Bách khoa Hóa học.',
    menuLocation:
      'Thanh bên trái → Học liệu & Kế hoạch → Nguyên tử & Cấu hình electron | Phân tử & Cấu tạo 3D | Bách khoa Hóa học',
    prerequisites: [
      'Nên chọn trước nguyên tố ở Bảng tuần hoàn 118 hoặc chọn trực tiếp tại thanh chọn nguyên tố/phân tử trong từng mục.',
    ],
    steps: [
      {
        title: 'Khám phá Nguyên tử & Cấu hình electron',
        detail:
          'Mở tab Nguyên tử & Cấu hình e, chọn một nguyên tố (hoặc đi từ Bảng tuần hoàn), chuyển qua lại giữa góc nhìn mô phỏng vỏ electron 3D và sơ đồ cấu hình electron theo ô lượng tử / phân lớp.',
        buttons: ['Nguyên tử & Cấu hình e'],
      },
      {
        title: 'Xoay và quan sát Phân tử & Cấu tạo 3D',
        detail:
          'Mở tab Phân tử & Cấu tạo 3D, chọn chất mẫu (như H₂O, NH₃, CH₄, CO₂, H₂SO₄, SO₃...) rồi kéo chuột hoặc chạm màn hình để xoay mô hình 3D 360°, quan sát góc liên kết và kiểu lai hóa.',
        buttons: ['Phân tử & Cấu tạo 3D'],
      },
      {
        title: 'Tra cứu kiến thức trong Bách khoa Hóa học',
        detail:
          'Mở tab Bách khoa Hóa học để xem dữ liệu tổng hợp tính chất vật lý, tính chất hóa học, điều chế và ứng dụng của các chất/nguyên tố, hoặc bấm nút quay nhanh về Bảng tuần hoàn / Nguyên tử 3D.',
        buttons: ['Bách khoa Hóa học'],
      },
    ],
    example: {
      title: 'Giải thích vì sao góc liên kết của CH₄ là 109,5° còn NH₃ là 107°',
      scenario:
        'Giáo viên mở Phân tử & Cấu tạo 3D, lần lượt chọn CH₄ (tứ diện đều) và NH₃ (chóp tam giác có 1 cặp electron tự do), xoay trực tiếp mô hình trước lớp.',
      outcome:
        'Học sinh hình dung rõ cấu trúc không gian thay vì chỉ nhìn hình vẽ phẳng trong sách giáo khoa.',
    },
    expectedResult:
      'Khung 3D hiển thị rõ hạt nhân, các lớp electron, nguyên tử và liên kết; thao tác xoay mượt không giật.',
    troubleshooting: [
      {
        issue: 'Khung 3D chậm hoặc không hiện khi mở nhiều tab trình duyệt cùng lúc.',
        cause: 'Trình duyệt giới hạn ngữ cảnh đồ họa WebGL khi mở quá nhiều khung 3D.',
        solution: 'Đóng bớt các tab không dùng và tải lại trang; chế độ 2D vẫn luôn sẵn sàng hoạt động song song.',
      },
    ],
    targetRoute: {
      tab: 'learning',
      sub: 'atoms-config',
      routeLabel: 'Nguyên tử & Cấu hình e',
    },
  },
  {
    id: 'ch6-matrix',
    chapterNumber: 6,
    title: 'CHƯƠNG 6: Ma trận & Bản đặc tả',
    shortTitle: 'Ma trận & Bản đặc tả',
    roles: ['Giáo viên', 'Quản trị viên'],
    purpose:
      'Thiết kế Ma trận đề kiểm tra dạng bảng tính trực quan chuẩn GDPT 2018 với đủ 4 dạng câu (Trắc nghiệm ABCD, Đúng/Sai nhiều ý, Trả lời ngắn, Tự luận) và 4 mức độ (NB, TH, VD, VDC), hỗ trợ giá trị 0 câu và điểm thập phân, tự động đồng bộ sang Bản đặc tả và xuất Word / Excel.',
    menuLocation: 'Thanh bên trái → Bài tập & Kiểm tra → Ma trận & Bản đặc tả',
    prerequisites: [
      'Xác định khối lớp (10, 11 hoặc 12), thời lượng làm bài và danh sách chủ đề/đơn vị kiến thức kiểm tra.',
    ],
    steps: [
      {
        title: 'Chọn ma trận có sẵn hoặc tạo ma trận trống mới',
        detail:
          'Ở chế độ Bảng tính Ma trận & Đặc tả, chọn một ma trận từ danh sách thả xuống hoặc nhấn nút tạo ma trận mới / nhân bản ma trận hiện có để sửa.',
        buttons: ['Bảng tính Ma trận & Đặc tả', 'Nhập Excel / Word / PDF', 'Thư viện tham khảo'],
      },
      {
        title: 'Nhập số câu và điểm từng ô theo dạng bài & mức độ',
        detail:
          'Nhấp thẳng vào từng ô NB, TH, VD, VDC của từng chủ đề để nhập số câu (hỗ trợ nhập 0 để bỏ dạng không thi) và điểm số thập phân. Tổng câu và tổng điểm từng dòng/cột tự động cộng chính xác.',
      },
      {
        title: 'Đồng bộ Ma trận sang Bản đặc tả & lưu bản nháp',
        detail:
          'Khi sửa số liệu ở Ma trận, hệ thống tự đồng bộ số câu mục tiêu sang Bản đặc tả mà vẫn giữ nguyên mô tả Yêu cầu cần đạt bạn đã nhập. Nếu có bản nháp dở trước đó, thanh vàng sẽ hiện nút Khôi phục bản nháp hoặc Bỏ qua.',
        buttons: ['Khôi phục bản nháp', 'Bỏ qua'],
      },
      {
        title: 'Lưu chính thức và xuất file Word / Excel hoặc chuyển sang tạo đề',
        detail:
          'Nhấn Lưu ma trận & bản đặc tả, sau đó chọn xuất tệp Word (.docx) hoặc Excel để lưu hồ sơ tổ chuyên môn, hoặc nhấn nút chuyển trực tiếp sang tab Tạo đề mới theo ma trận này.',
      },
    ],
    example: {
      title: 'Lập ma trận đề kiểm tra Giữa kỳ I Hóa học 11 (thang 10 điểm, bỏ phần Tự luận)',
      scenario:
        'Giáo viên vào Ma trận & Bản đặc tả, chọn khối 11, nhập 0 cho toàn bộ các ô Tự luận, giữ 12 câu MCQ (3,0 đ) + 4 câu Đúng/Sai (4,0 đ) + 6 câu Trả lời ngắn (3,0 đ), kiểm tra tổng đúng 10,0 điểm rồi nhấn lưu.',
      outcome:
        'Ma trận đạt đúng 10,0 điểm với 22 câu hỏi; Bản đặc tả cập nhật khớp hoàn toàn số câu từng mức độ và sẵn sàng để xuất Word hoặc rút câu hỏi tạo đề.',
    },
    expectedResult:
      'Lưu thành công ma trận hợp lệ, tự động cảnh báo nếu tổng điểm chưa khớp, xuất được Word/Excel đúng bảng biểu hành chính.',
    troubleshooting: [
      {
        issue: 'Tổng điểm cột bên phải chưa bằng 10,0.',
        cause: 'Điểm nhập thủ công ở một vài ô chưa khớp đơn vị điểm dự kiến của từng dạng câu.',
        solution: 'Kiểm tra lại điểm từng ô hoặc cột tổng điểm từng phần; hệ thống giữ nguyên số bạn nhập để bạn chủ động điều chỉnh.',
      },
      {
        issue: 'Nhập từ Excel / Word / PDF không tạo đủ toàn bộ dòng.',
        cause: 'Tệp gốc có ô gộp hoặc định dạng phức tạp.',
        solution: 'Kiểm tra phần xem trước dữ liệu đã trích xuất rồi bổ sung nốt các ô còn thiếu ngay trên bảng tính.',
      },
    ],
    targetRoute: {
      tab: 'assignments',
      sub: 'matrix-spec',
      routeLabel: 'Ma trận & Bản đặc tả',
      teacherOnly: true,
    },
  },
  {
    id: 'ch7-question-shuffle',
    chapterNumber: 7,
    title: 'CHƯƠNG 7: Ngân hàng câu hỏi, Tạo đề & Trộn mã đề',
    shortTitle: 'Đề thi, Ngân hàng & Trộn đề',
    roles: ['Giáo viên'],
    purpose:
      'Quản lý trọn vẹn chu trình ra đề chuẩn GDPT 2018: lưu trữ câu hỏi đã duyệt/bản nháp trong Ngân hàng câu hỏi, cấu hình 4 phần & tuyển chọn câu bám sát ma trận tại Tạo đề mới, sinh nhiều mã đề (101, 102..., 201... hoặc tự đặt) kèm ánh xạ đáp án tại Trộn đề & Mã đề, hoàn chỉnh Đáp án & Hướng dẫn chấm rồi xuất Word hoặc Giao bài.',
    menuLocation:
      'Thanh bên trái → Bài tập & Kiểm tra → Tổng quan đề kiểm tra | Tạo đề mới | Ngân hàng câu hỏi | Trộn đề & Mã đề | Đáp án & Hướng dẫn chấm | Đề đã lưu & Giao bài',
    prerequisites: [
      'Đã có Ma trận đề kiểm tra phù hợp (Chương 6).',
      'Ngân hàng câu hỏi đã có đủ câu hỏi ở trạng thái Đã duyệt cho các ô mức độ có số câu > 0.',
    ],
    steps: [
      {
        title: 'Quản lý & bổ sung Ngân hàng câu hỏi',
        detail:
          'Mở tab Ngân hàng câu hỏi. Dùng các bộ lọc Tất cả khối, Tất cả 4 dạng câu, Tất cả 4 mức độ, Mọi trạng thái duyệt để rà soát. Nhấn Thêm câu hỏi mới hoặc Nhập từ Word / PDF / Excel để thêm câu mới bằng Trình soạn thảo Hóa học.',
        buttons: ['Soạn Công Thức & Sơ Đồ', 'Nhập từ Word / PDF / Excel', 'Thêm câu hỏi mới'],
      },
      {
        title: 'Cấu hình thông tin đề & tuyển chọn từ Ma trận',
        detail:
          'Chuyển sang tab Tạo đề mới, chọn Ma trận cần dùng ở góc phải, nhập Tên đề kiểm tra, Tên trường, Khối lớp, Thời gian làm bài. Nhấn Lấy từ Ma trận để đồng bộ số câu 4 phần, rồi bấm Tuyển Chọn Câu Hỏi Bám Sát Ma Trận.',
        buttons: ['Lấy từ Ma trận', 'Tuyển Chọn Câu Hỏi Bám Sát Ma Trận'],
      },
      {
        title: 'Kiểm tra câu hỏi, chỉnh điểm hoặc đổi câu tương đương rồi lưu đề',
        detail:
          'Xem danh sách câu bên cột phải: có thể lên/xuống thứ tự, thay câu khác cùng mức độ hoặc sửa riêng nội dung câu trong đề. Sau đó lưu đề và chuyển sang trộn mã đề.',
      },
      {
        title: 'Trộn đề & Sinh mã đề tự động kèm ánh xạ đáp án',
        detail:
          'Tại tab Trộn đề & Mã đề, chọn đề kiểm tra vừa lưu, chọn Số lượng mã đề (ví dụ 4), chọn Quy tắc mã đề (101, 102, 103... hoặc 201, 202... hoặc Tiền tố tự chọn), khóa các câu không muốn đổi vị trí nếu cần, nhấn Trộn & Sinh Mã Đề và bấm Lưu Bộ Mã Đề.',
        buttons: ['Trộn & Sinh Mã Đề', 'Lưu Bộ Mã Đề'],
      },
      {
        title: 'Rà soát Đáp án & Hướng dẫn chấm, xuất Word và Giao bài',
        detail:
          'Mở Đáp án & Hướng dẫn chấm để đối chiếu đáp án theo từng mã đề và cập nhật thang điểm tự luận, khóa phiên bản nếu đề đã chốt. Cuối cùng vào Đề đã lưu & Giao bài để nhấn Xuất Word / In hoặc Giao bài cho lớp.',
        buttons: ['Giao bài cho lớp', 'Xuất Word / In'],
      },
    ],
    example: {
      title: 'Tạo đề kiểm tra 45 phút Hóa học 11 thành 4 mã đề 101, 102, 103, 104',
      scenario:
        'Giáo viên vào Tạo đề mới → chọn Ma trận Giữa kỳ I → bấm Tuyển Chọn Câu Hỏi Bám Sát Ma Trận → lưu đề → sang Trộn đề & Mã đề chọn 4 mã theo dãy 101 → bấm Lưu Bộ Mã Đề → kiểm tra đáp án từng mã ở Đáp án & Hướng dẫn chấm → giao cho lớp 11A1.',
      outcome:
        'Hệ thống sinh 4 mã đề 101–104 với phương án A/B/C/D xáo trộn an toàn và tự động tính lại bảng đáp án đúng cho từng mã đề.',
    },
    expectedResult:
      'Đề kiểm tra đầy đủ 4 phần (hoặc tắt linh hoạt phần có 0 câu), có bảng ánh xạ đáp án chuẩn theo từng mã đề, sẵn sàng xuất Word hoặc mở cho học sinh thi trực tuyến.',
    troubleshooting: [
      {
        issue: 'Báo đỏ "Ngân hàng câu hỏi chưa đủ cho ... ô trong Ma trận".',
        cause: 'Số lượng câu Đã duyệt trong Ngân hàng câu hỏi ít hơn yêu cầu ở một ô chủ đề – mức độ nào đó (hệ thống không tự bịa câu giả).',
        solution: 'Nhấn ngay nút Mở Ngân hàng câu hỏi để thêm câu thiếu hoặc Chỉnh sửa lại Ma trận cho khớp số câu hiện có.',
      },
      {
        issue: 'Không lưu được mã đề mới vì báo Đang bị KHÓA PHIÊN BẢN.',
        cause: 'Đề đã được khóa phiên bản tại tab Đáp án & Hướng dẫn chấm để tránh lệch kết quả thi.',
        solution: 'Vào tab Đáp án & Hướng dẫn chấm bấm Mở khóa phiên bản rồi quay lại trộn và lưu lại.',
      },
    ],
    targetRoute: {
      tab: 'assignments',
      sub: 'create-exam',
      routeLabel: 'Bài tập & Kiểm tra',
      teacherOnly: true,
    },
  },
  {
    id: 'ch8-editor',
    chapterNumber: 8,
    title: 'CHƯƠNG 8: Trình soạn thảo Hóa học thông minh',
    shortTitle: 'Soạn thảo Hóa học',
    roles: ['Giáo viên'],
    purpose:
      'Trình soạn thảo dùng chung duy nhất cho toàn ứng dụng (Ngân hàng câu hỏi, Đề kiểm tra, Đáp án/Lời giải, Bài học SGK và Phiếu học tập), giúp giáo viên gõ văn bản có định dạng, chèn công thức hóa học, ion/điện tích, phương trình phản ứng có điều kiện và vẽ cấu tạo hữu cơ 2D với xem trước trực tiếp.',
    menuLocation:
      'Dùng chung trong: Ngân hàng câu hỏi (Soạn Công Thức & Sơ Đồ / Thêm câu hỏi mới) · Tạo đề mới · Đáp án & Hướng dẫn chấm · Học liệu Hóa học · Kế hoạch dạy học',
    prerequisites: [
      'Nhấp chuột đặt con trỏ vào vùng soạn thảo ở vị trí muốn chèn trước khi bấm các nút công cụ.',
    ],
    steps: [
      {
        title: 'Định dạng văn bản và chỉ số trực tiếp (Hàng 1 thanh công cụ)',
        detail:
          'Sử dụng danh sách chọn Đoạn văn / Tiêu đề 1–3, các nút In đậm, In nghiêng, Gạch chân, Chỉ số dưới (ví dụ số 2, 4 trong H₂SO₄), Chỉ số trên (ví dụ ²⁻, ³⁺), Thoát chỉ số để gõ lại chữ thường, Căn trái/giữa/phải, Danh sách, Liên kết, Hình ảnh, Bảng và Hoàn tác / Làm lại.',
        buttons: ['Chỉ số dưới', 'Chỉ số trên', 'Thoát chỉ số', 'Hoàn tác', 'Làm lại'],
      },
      {
        title: 'Chèn công thức Hóa học nhanh với nút CT Hóa',
        detail:
          'Nhấn CT Hóa để mở bảng chèn công thức phân tử (axit, bazơ, muối, oxit, nhiệt hóa học ∆H). Nhập hoặc chọn mẫu có sẵn, quan sát khung xem trước hiển thị đẹp rồi nhấn xác nhận chèn vào văn bản.',
        buttons: ['CT Hóa'],
      },
      {
        title: 'Soạn phương trình phản ứng trực quan với PT phản ứng',
        detail:
          'Nhấn PT phản ứng để mở trình dựng phương trình theo từng ô: Chất tham gia, hệ số, trạng thái (k, l, r, dd), chọn loại mũi tên (→, ⇌ thuận nghịch), điền điều kiện trên/dưới mũi tên (xt, t°, p) và Chất sản phẩm. Xem trước trực tiếp rồi nhấn xác nhận chèn.',
        buttons: ['PT phản ứng'],
      },
      {
        title: 'Chèn nhanh Ion, Ký hiệu chuyên dụng, Điều kiện phản ứng & Cấu tạo 2D',
        detail:
          'Nhấn Ion & Điện tích để ghép ion (như SO₄²⁻, Fe³⁺, NH₄⁺); nhấn Ký hiệu Hóa học để mở bàn phím nhanh các ký hiệu thường dùng (↑, ↓, ⇌, °C, ΔH...); nhấn Điều kiện phản ứng để đặt mũi tên kèm điều kiện; nhấn Cấu tạo 2D để vẽ vòng benzene, mạch cacbon và liên kết đơn/đôi/ba.',
        buttons: ['Ion & Điện tích', 'Ký hiệu Hóa học', 'Cấu tạo 2D', 'Điều kiện phản ứng'],
      },
      {
        title: 'Chỉnh sửa lại công thức đã chèn chỉ bằng 1 cú nhấp chuột',
        detail:
          'Nhấp trực tiếp vào bất kỳ công thức, phương trình hay hình cấu tạo 2D nào đang nằm trong văn bản để mở lại đúng bảng chỉnh sửa của đối tượng đó và cập nhật tại chỗ.',
      },
    ],
    example: {
      title: 'Soạn câu hỏi chứa H₂SO₄, ion SO₄²⁻ và phản ứng thuận nghịch tổng hợp NH₃',
      scenario:
        'Giáo viên mở Ngân hàng câu hỏi → Thêm câu hỏi mới → gõ đề bài trong trình soạn thảo, dùng CT Hóa chèn H2SO4, dùng Ion & Điện tích chèn SO4^2-, và dùng PT phản ứng chèn N2(k) + 3H2(k) ⇌ 2NH3(k) có điều kiện xt, t°, p.',
      outcome:
        'Toàn bộ công thức, chỉ số dưới, điện tích mũ và mũi tên hai chiều kèm điều kiện hiển thị sắc nét đồng nhất cả khi thi trực tuyến lẫn khi xuất Word.',
    },
    expectedResult:
      'Công thức và phương trình hiển thị đúng chuẩn khoa học hóa học, tự lưu bản nháp khi đang gõ và giữ nguyên vị trí con trỏ khi chèn.',
    troubleshooting: [
      {
        issue: 'Gõ chữ tiếp theo sau chỉ số dưới bị nhỏ tụt xuống dòng.',
        cause: 'Chế độ Chỉ số dưới đang bật.',
        solution: 'Nhấn nút Thoát chỉ số màu vàng ngay bên cạnh nút Chỉ số trên hoặc bấm lại nút Chỉ số dưới để trở về cỡ chữ bình thường.',
      },
      {
        issue: 'Chèn nhầm công thức hoặc muốn sửa hệ số cân bằng trong phương trình đã chèn.',
        cause: 'Công thức đang đóng gói thành đối tượng thông minh.',
        solution: 'Nhấp thẳng lên phương trình đó trong khung soạn thảo để mở lại bảng sửa tại chỗ, không cần xóa đi viết lại từ đầu.',
      },
    ],
    targetRoute: {
      tab: 'assignments',
      sub: 'question-bank',
      routeLabel: 'Ngân hàng câu hỏi (Soạn thảo)',
      teacherOnly: true,
    },
  },
  {
    id: 'ch9-lab2d3d',
    chapterNumber: 9,
    title: 'CHƯƠNG 9: Phòng thí nghiệm ảo 2D/3D',
    shortTitle: 'Phòng thí nghiệm 2D/3D',
    roles: ['Giáo viên', 'Học sinh'],
    purpose:
      'Thực hiện mô phỏng các bài thí nghiệm Hóa học THPT lớp 10–11–12 theo chương trình GDPT 2018 trên hai chế độ đồng bộ: 2D Trực quan và 3D Không gian; hỗ trợ chọn dụng cụ thủy tinh, điều chỉnh thể tích/nồng độ hóa chất, lắc, đun đèn cồn, thử quỳ tím và ẩn/hiện lời dẫn sư phạm.',
    menuLocation: 'Thanh bên trái → Phòng thực hành 2D/3D → Phòng thí nghiệm ảo 2D/3D',
    prerequisites: [
      'Chọn sẵn khối lớp hoặc bài thí nghiệm mẫu cần thực hành, hoặc tự chọn dụng cụ và hóa chất trên khay.',
    ],
    steps: [
      {
        title: 'Chọn Khối lớp, Bài thí nghiệm hoặc tự lắp dụng cụ',
        detail:
          'Ở thanh trên, chọn Khối lớp (Tất cả, Lớp 10, Lớp 11, Lớp 12) rồi chọn Bài thí nghiệm từ danh sách. Nếu muốn tự thí nghiệm tự do, nhấn vào các dụng cụ ở Khay dụng cụ thí nghiệm (Ống nghiệm, Cốc thủy tinh 100 mL, Bình tam giác, Bình cầu, Đèn cồn) để đặt lên bàn.',
        buttons: ['Tất cả', 'Lớp 10', 'Lớp 11', 'Lớp 12'],
      },
      {
        title: 'Chọn đúng dụng cụ đích và thêm hóa chất',
        detail:
          'Phía trên bàn thí nghiệm, nhấn tên dụng cụ đang chọn (ví dụ Ống nghiệm 1). Sang cột Khay hóa chất bên phải, lọc hoặc tìm tên/công thức chất, chỉnh lượng (mL / gam / nồng độ M) rồi nhấn nút Thêm vào.',
        buttons: ['2D Trực quan', '3D Không gian'],
      },
      {
        title: 'Thực hiện thao tác bổ trợ và chuyển góc nhìn 2D ↔ 3D',
        detail:
          'Thực hiện lắc trộn, bật đèn cồn đun nóng hoặc thử giấy quỳ tím nếu phản ứng yêu cầu. Nhấn chuyển qua lại giữa 2D Trực quan và 3D Không gian bất kỳ lúc nào mà vẫn giữ nguyên dung dịch và kết tủa đang có trong ống nghiệm.',
        buttons: ['Làm lại', 'Hiện giải thích', 'Ẩn giải thích', 'Ẩn lời dẫn', 'Lời dẫn giáo viên'],
      },
      {
        title: 'Bật/tắt Lời dẫn giáo viên & Giải thích bản chất khi giảng dạy',
        detail:
          'Khi cho học sinh dự đoán hiện tượng trước phản ứng, nhấn Ẩn giải thích; sau khi học sinh quan sát màu dung dịch, kết tủa hoặc khí bay ra, nhấn Hiện giải thích để chiếu phương trình phản ứng và giải thích khoa học.',
      },
    ],
    example: {
      title: 'Thí nghiệm nhận biết ion sulfate tạo kết tủa trắng BaSO₄',
      scenario:
        'Chọn Ống nghiệm 1 → thêm 5 mL dung dịch BaCl₂ 1M → thêm tiếp 5 mL dung dịch H₂SO₄ 1M → quan sát kết tủa trắng xuất hiện lắng xuống đáy ống nghiệm rồi chuyển sang chế độ 3D Không gian để xoay quan sát toàn cảnh.',
      outcome:
        'Màn hình hiển thị kết tủa trắng BaSO₄↓ kèm hiện tượng chi tiết và phương trình BaCl₂ + H₂SO₄ → BaSO₄↓ + 2HCl khi mở phần giải thích.',
    },
    expectedResult:
      'Phản ứng hóa học xảy ra chính xác hiện tượng (đổi màu, kết tủa, sủi bọt khí, đổi màu quỳ tím), đồng bộ mượt mà giữa khung vẽ 2D và mô hình 3D.',
    troubleshooting: [
      {
        issue: 'Đã nhấn Thêm hóa chất nhưng ống nghiệm đang nhìn không thấy thay đổi.',
        cause: 'Bạn đang chọn nhầm dụng cụ khác (ví dụ Ống nghiệm 2 thay vì Ống nghiệm 1).',
        solution: 'Kiểm tra nút Dụng cụ đang chọn ngay phía trên bàn thí nghiệm để chắc chắn đang chọn đúng ống nghiệm bạn muốn nhỏ hóa chất vào.',
      },
      {
        issue: 'Bàn thực hành báo đầy không thêm được dụng cụ mới.',
        cause: 'Mỗi phiên thực hành cho phép tối đa 6 dụng cụ cùng lúc để quan sát rõ.',
        solution: 'Nhấn xóa bớt dụng cụ không dùng hoặc nhấn nút Làm lại ở góc trên để dọn mới bàn thí nghiệm.',
      },
    ],
    targetRoute: {
      tab: 'lab',
      sub: 'virtual-lab',
      routeLabel: 'Phòng thí nghiệm ảo 2D/3D',
    },
  },
  {
    id: 'ch10-sims',
    chapterNumber: 10,
    title: 'CHƯƠNG 10: Mô phỏng Phản ứng – Ion, Điện hóa, Chuẩn độ & Tính toán',
    shortTitle: 'Mô phỏng & Tính toán',
    roles: ['Giáo viên', 'Học sinh'],
    purpose:
      'Gom gọn 4 phòng mô phỏng chuyên sâu nằm cùng trong Phòng thực hành 2D/3D: Phản ứng & Ion (phản ứng trao đổi ion & bảng tính tan), Điện hóa & Pin (suất điện động chuẩn & điện phân), Dung dịch & Chuẩn độ (đường cong chuẩn độ acid–base & đổi màu chỉ thị) và Phương trình & Tính toán (tính số mol, chất dư, hiệu suất & cân bằng phương trình).',
    menuLocation:
      'Thanh bên trái → Phòng thực hành 2D/3D → Phản ứng & Ion | Điện hóa & Pin | Dung dịch & Chuẩn độ | Phương trình & Tính toán',
    prerequisites: [
      'Xác định đúng phân hệ mô phỏng tương ứng với chuyên đề đang dạy hoặc ôn tập.',
    ],
    steps: [
      {
        title: 'Mở Phản ứng & Ion',
        detail:
          'Chọn tab Phản ứng & Ion để chọn cặp cation và anion hoặc hai dung dịch điện li, quan sát phương trình phân tử, phương trình ion rút gọn và điều kiện tạo kết tủa / khí / chất điện li yếu.',
        buttons: ['Phản ứng & Ion'],
      },
      {
        title: 'Thực hành Điện hóa & Pin',
        detail:
          'Chọn tab Điện hóa & Pin để lắp pin Galvani từ hai cặp oxi hóa–khử (như Zn²⁺/Zn và Cu²⁺/Cu), xem chiều dòng electron chạy từ cực âm sang cực dương và công thức tính sức điện động chuẩn E°pin.',
        buttons: ['Điện hóa & Pin'],
      },
      {
        title: 'Thực hành Dung dịch & Chuẩn độ',
        detail:
          'Chọn tab Dung dịch & Chuẩn độ, chọn dung dịch trong buret và bình tam giác, chất chỉ thị (phenolphthalein hoặc methyl da cam), kéo thanh thể tích hoặc bấm nhỏ từng giọt để theo dõi giá trị pH và điểm tương đương.',
        buttons: ['Dung dịch & Chuẩn độ'],
      },
      {
        title: 'Sử dụng công cụ Phương trình & Tính toán',
        detail:
          'Chọn tab Phương trình & Tính toán để nhập khối lượng/số mol các chất tham gia, kiểm tra chất hết – chất dư, lượng sản phẩm thu được và cân bằng hệ số phương trình nhanh.',
        buttons: ['Phương trình & Tính toán'],
      },
    ],
    example: {
      title: 'Chuẩn độ dung dịch HCl bằng NaOH 0,1M dùng chỉ thị phenolphthalein',
      scenario:
        'Vào Dung dịch & Chuẩn độ → chọn dung dịch chuẩn NaOH trên buret và HCl trong bình tam giác → nhỏ dần dung dịch NaOH cho tới khi pH nhảy qua 7 và dung dịch chuyển sang màu hồng nhạt bền.',
      outcome:
        'Hiển thị chính xác thể tích NaOH tại điểm tương đương, giá trị pH thay đổi theo từng giọt và phương trình trung hòa.',
    },
    expectedResult:
      'Mỗi mô phỏng phản hồi theo thời gian thực khi thay đổi nồng độ, cặp điện cực hoặc thể tích dung dịch.',
    troubleshooting: [
      {
        issue: 'Chọn hai muối trộn với nhau nhưng không thấy phản ứng xảy ra.',
        cause: 'Các ion tạo thành đều tan và không tạo chất khí hay chất điện li yếu.',
        solution: 'Thử thay đổi ion để xuất hiện kết tủa (ví dụ Ba²⁺ + SO₄²⁻, Ag⁺ + Cl⁻) hoặc chất khí (H⁺ + CO₃²⁻).',
      },
    ],
    targetRoute: {
      tab: 'lab',
      sub: 'reactions-ions',
      routeLabel: 'Phản ứng & Ion',
    },
  },
  {
    id: 'ch11-flashcard',
    chapterNumber: 11,
    title: 'CHƯƠNG 11: Flashcard Hóa học & Trò chơi Dãy Hoạt Động',
    shortTitle: 'Flashcard & Trò chơi',
    roles: ['Giáo viên', 'Học sinh'],
    purpose:
      'Ghi nhớ nhanh công thức, tính chất vật lý, tính chất hóa học và cấu trúc không gian của các chất tiêu biểu lớp 10–11–12 qua thẻ hai mặt tích hợp mô hình 3D xoay 360°, kết hợp Trò chơi Bí Kíp Dãy Hoạt Động Hóa Học chuẩn dãy kim loại.',
    menuLocation: 'Thanh bên trái → Flashcard Hóa học → Flashcard Hóa học hoặc Bí kíp Dãy Hoạt Động',
    prerequisites: [
      'Không cần chuẩn bị thêm tài liệu ngoài; học sinh có thể tự đánh dấu thẻ đã thuộc bằng biểu tượng Ngôi sao.',
    ],
    steps: [
      {
        title: 'Tìm kiếm và lọc bộ thẻ chất hóa học',
        detail:
          'Tại mục Flashcard Hóa học, nhập tên chất hoặc công thức vào ô Tìm tên chất hoặc công thức..., chọn Khối lớp (Tất cả lớp, Lớp 10, Lớp 11, Lớp 12) và nhóm chất (Tất cả, Đã thuộc (⭐), Axit, Oxit, Hợp chất chứa Nitơ, Muối, Hiđrocacbon).',
        buttons: ['Tất cả', 'Đã thuộc (⭐)'],
      },
      {
        title: 'Lật thẻ hai mặt và đánh dấu đã thuộc',
        detail:
          'Mặt trước hiển thị tên chất, công thức, khối lượng mol, góc liên kết/lai hóa. Nhấn nút Lật xem mặt sau để xem chi tiết tính chất vật lý, tính chất hóa học, phương trình tiêu biểu, ứng dụng và lưu ý an toàn. Nhấn Ngôi sao để đưa vào danh sách Đã thuộc.',
        buttons: ['Lật xem mặt sau', 'Lật về trước'],
      },
      {
        title: 'Phóng to và xoay mô hình phân tử 3D 360°',
        detail:
          'Nhấn nút Xoay 3D 360° (hoặc biểu tượng phóng to) trên thẻ để mở trình quan sát phân tử 3D tương tác, dùng chuột kéo xoay mọi góc độ của phân tử NH₃, H₂SO₄, CH₄, CO₂...',
        buttons: ['Xoay 3D 360°'],
      },
      {
        title: 'Chơi Trò Chơi Bí Kíp Dãy Hoạt Động Hóa Học',
        detail:
          'Chuyển sang tab Bí kíp Dãy Hoạt Động để sắp xếp hoặc ghép cặp chuẩn dãy hoạt động hóa học của kim loại (K, Na, Ca, Mg, Al, Zn, Fe, Ni, Sn, Pb, (H), Cu, Hg, Ag, Pt, Au) và quy luật đẩy kim loại / tác dụng nước / tác dụng axit.',
        buttons: ['Trò Chơi Bí Kíp Dãy Hoạt Động'],
      },
    ],
    example: {
      title: 'Ôn tập phân tử H₂SO₄ và kiểm tra độ ghi nhớ',
      scenario:
        'Học sinh chọn nhóm Axit → chọn thẻ Axit sunfuric (H₂SO₄) → nhấn Xoay 3D 360° để xem cấu tạo tứ diện quanh S → đóng và nhấn Lật xem mặt sau để đọc lưu ý an toàn pha loãng acid → đánh dấu ngôi sao Đã thuộc.',
      outcome:
        'Thẻ lật mượt giữa 2 mặt và được lưu vào bộ lọc Đã thuộc (⭐) phục vụ ôn tập trước giờ kiểm tra.',
    },
    expectedResult:
      'Nắm vững tính chất hóa học và cấu trúc không gian phân tử mà không bị phân tán bởi nội dung rườm rà.',
    troubleshooting: [
      {
        issue: 'Không thấy bất kỳ thẻ nào hiển thị sau khi lọc.',
        cause: 'Đang kết hợp từ khóa tìm kiếm với bộ lọc Đã thuộc (⭐) hoặc lớp chưa khớp.',
        solution: 'Nhấn nút đặt lại bộ lọc / chọn lại Tất cả và xóa trắng ô tìm kiếm.',
      },
    ],
    targetRoute: {
      tab: 'flashcard',
      sub: 'flashcard',
      routeLabel: 'Flashcard Hóa học',
    },
  },
  {
    id: 'ch12-results-parents',
    chapterNumber: 12,
    title: 'CHƯƠNG 12: Kết quả, Chấm bài & Nhắn tin Phụ huynh',
    shortTitle: 'Kết quả & Phụ huynh',
    roles: ['Giáo viên', 'Học sinh', 'Phụ huynh'],
    purpose:
      'Quản lý quy trình chấm bài – duyệt điểm có kiểm toán (audit log), kiểm soát chặt chẽ trạng thái công bố điểm (chỉ phụ huynh/học sinh thấy khi giáo viên nhấn Công bố), soạn nhanh tin nhắn Zalo ≤ 150 ký tự từ điểm đã duyệt, đồng thời giải thích cổng xem điểm dành cho Học sinh và Phụ huynh.',
    menuLocation:
      'Giáo viên: Thanh bên trái → Kết quả & Phụ huynh → Bảng điểm & Công bố | Tin nhắn Phụ huynh · Học sinh: Tiến độ & Kết quả · Phụ huynh: Kết quả học tập',
    prerequisites: [
      'Đã có ít nhất 1 đề kiểm tra đã giao và bài nộp của học sinh.',
    ],
    steps: [
      {
        title: 'Lọc bài nộp theo Lớp và Bài kiểm tra',
        detail:
          'Tại Bảng Điểm & Kết Quả Công Bố, chọn Lớp học và Bài kiểm tra ở thanh bộ lọc phía trên, sau đó nhấp vào tên học sinh ở danh sách để mở chi tiết bài làm.',
      },
      {
        title: 'Chấm tự luận, điều chỉnh điểm và ghi nhận xét kiểm toán',
        detail:
          'Nhập điểm cho từng câu tự luận hoặc điểm tổng điều chỉnh, gõ nhận xét gửi học sinh bằng trình soạn thảo, điền Lý do điều chỉnh / Nhận xét phê duyệt rồi bấm Lưu kết quả chấm bài.',
      },
      {
        title: 'Công bố điểm cá nhân hoặc toàn lớp',
        detail:
          'Chỉ khi nhấn Công bố điểm (cho 1 em) hoặc nút công bố cả lớp thì điểm và nhận xét mới hiển thị sang Cổng Học sinh, Cổng Phụ huynh và mục Soạn tin nhắn.',
      },
      {
        title: 'Soạn & sao chép tin nhắn Phụ huynh chuẩn 150 ký tự',
        detail:
          'Chuyển sang tab Tin nhắn Phụ huynh (Zalo SMS), chọn lớp, chọn học sinh, chọn loại thông báo (Báo điểm, Tiến độ, Nhắc nộp bài, Khen ngợi), chỉnh sửa nội dung gọn trong ngưỡng ≤ 150 ký tự rồi nhấn Sao chép & Lưu nhật ký để dán gửi qua Zalo.',
      },
    ],
    example: {
      title: 'Chấm câu tự luận bài 15 phút lớp 11A1, công bố điểm và báo phụ huynh',
      scenario:
        'Giáo viên mở Bảng điểm & Công bố → chọn bài nộp trạng thái NEEDS_REVIEW → chấm điểm câu tự luận, điền lý do phê duyệt → lưu và nhấn Công bố điểm → sang tab Tin nhắn Phụ huynh chọn đúng học sinh đó để lấy mẫu tin nhắn báo điểm có sẵn.',
      outcome:
        'Điểm chính thức hiện ngay bên Cổng Phụ huynh của học sinh đó; lịch sử điều chỉnh điểm được lưu vết minh bạch.',
    },
    expectedResult:
      'Tuyệt đối không lộ điểm nháp hoặc điểm đang chờ chấm ra bên ngoài; tin nhắn Zalo ngắn gọn, chính xác và có lưu nhật ký.',
    troubleshooting: [
      {
        issue: 'Bấm lưu chấm bài báo lỗi yêu cầu nhập lý do.',
        cause: 'Hệ thống bắt buộc có Lý do điều chỉnh / Nhận xét phê duyệt để bảo đảm minh bạch kiểm toán điểm số.',
        solution: 'Nhập ngắn gọn lý do vào ô bắt buộc (ví dụ: "Chấm hoàn tất câu tự luận") rồi nhấn lưu lại.',
      },
      {
        issue: 'Phụ huynh phản ánh chưa thấy điểm dù học sinh đã nộp bài.',
        cause: 'Bài nộp đang ở trạng thái Ẩn điểm (HIDDEN) do giáo viên chưa nhấn Công bố.',
        solution: 'Giáo viên vào Bảng điểm & Công bố (hoặc tab Đề đã lưu & Giao bài) nhấn Công bố điểm cho học sinh hoặc cả lớp.',
      },
    ],
    targetRoute: {
      tab: 'results-parents',
      sub: 'results',
      routeLabel: 'Kết quả & Phụ huynh',
    },
  },
  {
    id: 'ch13-admin',
    chapterNumber: 13,
    title: 'CHƯƠNG 13: Quản trị hệ thống',
    shortTitle: 'Quản trị hệ thống',
    roles: ['Giáo viên', 'Quản trị viên'],
    purpose:
      'Theo dõi tình trạng thẩm định chuyên môn của Tổ Hóa học theo chuẩn GDPT 2018, kiểm tra phân bổ dữ liệu học sinh toàn trường, quy tắc bảo mật chấm điểm và khôi phục dữ liệu mẫu khi cần làm sạch môi trường thực hành.',
    menuLocation:
      'Thanh bên trái → Quản trị hệ thống → Chuyên môn Tổ Hóa | Cài đặt & Dữ liệu',
    prerequisites: [
      'Đang sử dụng vai trò Giáo viên, Tổ trưởng Chuyên môn hoặc Quản trị viên.',
    ],
    steps: [
      {
        title: 'Kiểm tra trạng thái Chuyên môn Tổ Hóa',
        detail:
          'Mở tab Chuyên môn Tổ Hóa để xem thông tin Tổ trưởng Chuyên môn và xác nhận tình trạng thẩm định kế hoạch dạy học học kỳ hiện tại.',
        buttons: ['Quản Lý Chuyên Môn Tổ Hóa'],
      },
      {
        title: 'Kiểm tra Cài đặt Hệ thống & Dữ liệu',
        detail:
          'Chuyển sang tab Cài đặt & Dữ liệu để xem thống kê tổng 108 học sinh phân bổ trên 3 lớp 10A1, 11A1, 12A1 và nhắc lại nguyên tắc bảo mật công bố điểm.',
        buttons: ['Cài Đặt Hệ Thống & Dữ Liệu'],
      },
      {
        title: 'Khôi phục dữ liệu mẫu ban đầu (chỉ dùng khi cần)',
        detail:
          'Nếu muốn xóa các bài thử nghiệm để quay về bộ dữ liệu chuẩn ban đầu của hệ thống, nhấn nút Khôi phục dữ liệu mẫu ban đầu và xác nhận trong hộp thoại cảnh báo.',
        buttons: ['Khôi phục dữ liệu mẫu ban đầu'],
      },
    ],
    example: {
      title: 'Kiểm tra lại hệ thống trước buổi tập huấn giáo viên tổ Hóa',
      scenario:
        'Tổ trưởng chuyên môn mở Quản trị hệ thống → Chuyên môn Tổ Hóa kiểm tra trạng thái thẩm định, sau đó vào Cài đặt & Dữ liệu để xác nhận đủ 108 hồ sơ học sinh trước khi giới thiệu cho tổ.',
      outcome:
        'Dữ liệu mẫu sạch sẽ, phân bổ lớp đầy đủ và các quy tắc bảo mật điểm số hoạt động bình thường.',
    },
    expectedResult:
      'Các thông số tổ chuyên môn và dữ liệu học sinh hiển thị nhất quán, thao tác khôi phục có cảnh báo an toàn tránh bấm nhầm.',
    troubleshooting: [
      {
        issue: 'Bấm Khôi phục dữ liệu mẫu ban đầu nhưng dữ liệu tự nhập bị mất.',
        cause: 'Chức năng này đặt lại dữ liệu lưu trên trình duyệt về bộ dữ liệu gốc ban đầu.',
        solution: 'Trước khi khôi phục, hãy xuất danh sách học sinh bằng nút Xuất Excel và xuất các đề thi/ma trận quan trọng sang Word (.docx).',
      },
    ],
    targetRoute: {
      tab: 'admin-system',
      sub: 'department',
      routeLabel: 'Quản trị hệ thống',
      teacherOnly: true,
    },
  },
  {
    id: 'ch14-errors',
    chapterNumber: 14,
    title: 'CHƯƠNG 14: Xử lý các lỗi thường gặp',
    shortTitle: 'Xử lý lỗi thường gặp',
    roles: ['Giáo viên', 'Học sinh', 'Phụ huynh', 'Quản trị viên'],
    purpose:
      'Tổng hợp các tình huống vướng mắc thực tế thường gặp trong quá trình tạo đề, nhập công thức Hóa học, làm thí nghiệm ảo, trộn mã đề và đồng bộ dữ liệu trên trình duyệt, kèm hướng dẫn tự khắc phục ngay.',
    menuLocation: 'Header → Hướng dẫn sử dụng → Mục Chương 14 hoặc Cách xử lý lỗi thường gặp',
    prerequisites: [
      'Xác định đúng thông báo đang xuất hiện trên màn hình hoặc chức năng đang thao tác.',
    ],
    steps: [
      {
        title: 'Kiểm tra vai trò đang chọn và bộ lọc đang bật',
        detail:
          'Nhiều trường hợp không thấy đề kiểm tra, không thấy menu giáo viên hoặc không thấy danh sách học sinh là do đang chọn nhầm vai trò Học sinh/Phụ huynh ở góc trên phải hoặc quên tắt bộ lọc tìm kiếm.',
      },
      {
        title: 'Đọc kỹ thông báo hướng dẫn ngay tại màn hình thao tác',
        detail:
          'Các cảnh báo vàng/đỏ trong Ma trận, Tạo đề mới, Trộn đề & Mã đề và Chấm bài đều chỉ rõ nguyên nhân (thiếu câu ở ô nào, lệch tổng điểm, đề đang bị khóa phiên bản hoặc thiếu lý do duyệt điểm).',
      },
      {
        title: 'Tận dụng nút Khôi phục nháp và nút Làm lại an toàn',
        detail:
          'Trong Trình soạn thảo, Ma trận và Tạo đề mới có cơ chế tự lưu nháp tự động giúp lấy lại nội dung khi lỡ tải lại trang. Trong Phòng thí nghiệm dùng nút Làm lại để dọn bàn thực hành.',
        buttons: ['Khôi phục bản nháp', 'Khôi phục nháp', 'Làm lại'],
      },
    ],
    example: {
      title: 'Khắc phục lỗi không lưu được mã đề sau khi chỉnh đáp án câu hỏi trong đề',
      scenario:
        'Giáo viên chỉnh sửa câu hỏi nhưng đề trước đó đã khóa phiên bản ở tab Đáp án. Mở Đáp án & Hướng dẫn chấm để bấm Mở khóa phiên bản, quay lại Trộn đề & Mã đề nhấn Lưu Bộ Mã Đề, rồi khóa lại phiên bản chính thức.',
      outcome:
        'Toàn bộ mã đề và đáp án mới được đồng bộ chính xác 100%, không còn cảnh báo lệch phiên bản.',
    },
    expectedResult:
      'Người dùng tự xử lý được hầu hết vướng mắc kỹ thuật hoặc thao tác chỉ trong 10–30 giây mà không mất dữ liệu đang làm.',
    troubleshooting: [
      {
        issue: 'Trình duyệt báo đầy bộ nhớ lưu trữ hoặc nháp cũ gây rối.',
        cause: 'Nhiều bản nháp lớn tích tụ lâu ngày trên bộ nhớ trình duyệt (LocalStorage).',
        solution: 'Nhấn Bỏ qua trên banner bản nháp không còn cần thiết, hoặc xuất bản sao lưu Word/Excel rồi làm mới lại tab.',
      },
      {
        issue: 'Khung 2D/3D trên thiết bị cấu hình thấp bị chậm.',
        cause: 'Mở nhiều hiệu ứng đồ họa nặng cùng lúc.',
        solution: 'Chuyển sang chế độ 2D Trực quan trong Phòng thí nghiệm ảo để thao tác nhẹ và phản hồi nhanh hơn.',
      },
    ],
    targetRoute: {
      tab: 'overview',
      routeLabel: 'Tổng quan',
    },
  },
];

export const WORKED_EXAMPLES: GuideWorkedExample[] = [
  {
    id: 'ex-1-class-manage',
    order: 1,
    title: 'Quản lý danh sách lớp & tạo danh sách lớp mới qua nhập dữ liệu',
    category: 'Lớp học & Học sinh',
    chapterId: 'ch2-classes',
    goal: 'Xem nhanh sĩ số 3 lớp 10A1, 11A1, 12A1, lọc lớp chủ nhiệm 11A1 và bổ sung học sinh mới hàng loạt từ Excel/CSV.',
    steps: [
      'Ở thanh bên trái, chọn Lớp học & Học sinh → Danh sách lớp & học sinh.',
      'Nhấp vào thẻ Lớp 11A1 để lọc ngay 39 học sinh của lớp này; kiểm tra hai hồ sơ trùng tên Phạm Ngọc Tường Vy được phân biệt bằng mã HS11028 và HS11029.',
      'Để thêm nhiều học sinh mới theo file danh sách lớp, nhấn Excel mẫu để tải mẫu chuẩn, điền danh sách rồi nhấn Nhập Excel và chọn file để nhập vào hệ thống.',
    ],
    expectedOutcome:
      'Lớp được lọc đúng sĩ số, không bị trùng hay gộp nhầm hồ sơ học sinh trùng tên và cập nhật được danh sách hàng loạt.',
    targetRoute: { tab: 'classes', sub: 'class-list', routeLabel: 'Mở Lớp học & Học sinh', teacherOnly: true },
  },
  {
    id: 'ex-2-add-student',
    order: 2,
    title: 'Thêm một học sinh mới vào lớp 11A1',
    category: 'Lớp học & Học sinh',
    chapterId: 'ch2-classes',
    goal: 'Thêm trực tiếp hồ sơ 1 học sinh mới nhập học đầy đủ thông tin cá nhân và SĐT phụ huynh.',
    steps: [
      'Mở Lớp học & Học sinh → Danh sách lớp & học sinh.',
      'Nhấn nút màu xanh Thêm học sinh ở góc phải thanh công cụ.',
      'Điền Họ tên học sinh, kiểm tra Mã HS tự sinh, chọn Lớp 11A1, Giới tính, Ngày sinh và nhập SĐT phụ huynh rồi bấm Lưu.',
    ],
    expectedOutcome:
      'Học sinh mới xuất hiện ngay trong bảng danh sách lớp 11A1 và đếm đúng tổng sĩ số mới.',
    targetRoute: { tab: 'classes', sub: 'class-list', routeLabel: 'Mở Lớp học & Học sinh', teacherOnly: true },
  },
  {
    id: 'ex-3-review-plan',
    order: 3,
    title: 'Lập kế hoạch dạy học / ôn tập và xuất phiếu học tập',
    category: 'Học liệu & Kế hoạch',
    chapterId: 'ch3-learning',
    goal: 'Cập nhật mục tiêu bài dạy và soạn nội dung phiếu học tập có công thức hóa học rồi xuất sang Word (.docx).',
    steps: [
      'Chọn Học liệu & Kế hoạch → Kế hoạch dạy học và chọn Khối lớp 11.',
      'Nhấn Thêm kế hoạch (hoặc Chỉnh sửa trên một tuần học đã có).',
      'Nhập Tên bài dạy, soạn phần Mục tiêu bài dạy và Phiếu học tập bằng Trình soạn thảo Hóa học, bấm Lưu kế hoạch.',
      'Nhấn nút xuất phiếu học tập (.docx) để tải tệp Word hoàn chỉnh về máy. Để gắn đề kiểm tra vào lộ trình ôn luyện, mở tab Kế hoạch ôn tập.',
    ],
    expectedOutcome:
      'Kế hoạch và phiếu học tập được lưu vào phân phối chương trình và xuất ra file Word trình bày sạch đẹp.',
    targetRoute: { tab: 'learning', sub: 'teaching-plan', routeLabel: 'Mở Kế hoạch dạy học', teacherOnly: true },
  },
  {
    id: 'ex-4-matrix',
    order: 4,
    title: 'Tạo ma trận đề kiểm tra 10 điểm chuẩn GDPT 2018',
    category: 'Ma trận & Bản đặc tả',
    chapterId: 'ch6-matrix',
    goal: 'Lập bảng ma trận hỗ trợ cả giá trị 0 câu và điểm thập phân, tự động đồng bộ sang Bản đặc tả.',
    steps: [
      'Vào Bài tập & Kiểm tra → Ma trận & Bản đặc tả.',
      'Chọn chế độ Bảng tính Ma trận & Đặc tả, tạo mới hoặc chọn một ma trận mẫu cần điều chỉnh.',
      'Nhập số câu vào các ô NB, TH, VD, VDC ở 4 nhóm dạng bài (nhập 0 ở dạng bài không dùng, ví dụ Tự luận = 0), nhập điểm thập phân (ví dụ 0.25, 0.5, 1.0) để tổng cột bên phải đạt đúng 10 điểm.',
      'Kiểm tra lại Bản đặc tả đã tự động cập nhật số câu rồi bấm Lưu ma trận & bản đặc tả.',
    ],
    expectedOutcome:
      'Hệ thống lưu ma trận hoàn chỉnh, bảng tổng hợp cuối bảng hiển thị chuẩn 100% cơ cấu mức độ và tổng điểm.',
    targetRoute: { tab: 'assignments', sub: 'matrix-spec', routeLabel: 'Mở Ma trận & Bản đặc tả', teacherOnly: true },
  },
  {
    id: 'ex-5-create-edit-exam',
    order: 5,
    title: 'Tạo đề kiểm tra mới từ ma trận và chỉnh sửa câu hỏi trong đề',
    category: 'Tạo đề & Chỉnh sửa',
    chapterId: 'ch7-question-shuffle',
    goal: 'Sinh tự động đề kiểm tra bám sát ma trận vừa lập và thay/sửa 1 câu trực tiếp mà không làm hỏng ngân hàng gốc.',
    steps: [
      'Vào Bài tập & Kiểm tra → Tạo đề mới.',
      'Ở góc trên phải, chọn đúng Ma trận vừa tạo, điền Tên đề kiểm tra và bấm Lấy từ Ma trận ở mục Cấu Trúc 4 Phần.',
      'Nhấn nút Tuyển Chọn Câu Hỏi Bám Sát Ma Trận ở cuối cột trái để tự động lấy đủ câu hỏi.',
      'Ở danh sách câu bên phải, thử bấm nút lên/xuống hoặc đổi câu khác cùng mức độ, sau đó lưu đề kiểm tra.',
    ],
    expectedOutcome:
      'Đề kiểm tra được lưu trong tab Đề đã lưu & Giao bài, giữ đúng tỷ lệ mức độ theo ma trận.',
    targetRoute: { tab: 'assignments', sub: 'create-exam', routeLabel: 'Mở Tạo đề mới', teacherOnly: true },
  },
  {
    id: 'ex-6-shuffle-answers',
    order: 6,
    title: 'Trộn đề thành 4 mã đề và kiểm tra ánh xạ đáp án',
    category: 'Trộn đề & Đáp án',
    chapterId: 'ch7-question-shuffle',
    goal: 'Sinh các mã đề 101, 102, 103, 104 với phương án A/B/C/D tự đảo và đối chiếu bảng đáp án.',
    steps: [
      'Vào Bài tập & Kiểm tra → Trộn đề & Mã đề, chọn đề kiểm tra vừa tạo ở danh sách trên cùng.',
      'Nhập Số lượng mã đề = 4, chọn Quy tắc mã đề là 101, 102, 103... và bấm Trộn & Sinh Mã Đề.',
      'Chuyển qua từng mã 101, 102, 103, 104 để xem đề trộn, rồi nhấn Lưu Bộ Mã Đề.',
      'Mở tiếp tab Đáp án & Hướng dẫn chấm để kiểm tra toàn bộ đáp án chính xác ứng với từng mã đề.',
    ],
    expectedOutcome:
      'Cả 4 mã đề đều có bộ đáp án ánh xạ chuẩn 1-1 tương ứng với thứ tự câu và phương án sau khi trộn.',
    targetRoute: { tab: 'assignments', sub: 'shuffle-variants', routeLabel: 'Mở Trộn đề & Mã đề', teacherOnly: true },
  },
  {
    id: 'ex-7-formula-h2so4',
    order: 7,
    title: 'Nhập công thức H₂SO₄ trong Trình soạn thảo Hóa học',
    category: 'Trình soạn thảo Hóa học',
    chapterId: 'ch8-editor',
    goal: 'Chèn công thức axit sunfuric hiển thị chuẩn chỉ số dưới H₂SO₄ ở bất kỳ khung soạn thảo nào.',
    steps: [
      'Mở Bài tập & Kiểm tra → Ngân hàng câu hỏi rồi nhấn nút Soạn Công Thức & Sơ Đồ (hoặc nhấn Thêm câu hỏi mới).',
      'Cách 1 (khuyên dùng): Nhấn nút CT Hóa trên thanh công cụ hóa học, gõ H2SO4, kiểm tra khung xem trước hiện H₂SO₄ rồi nhấn xác nhận chèn.',
      'Cách 2 (gõ trực tiếp): Gõ chữ H, bật nút Chỉ số dưới gõ số 2, tắt chỉ số dưới gõ SO, bật lại Chỉ số dưới gõ số 4, rồi nhấn nút Thoát chỉ số để tiếp tục gõ chữ thường.',
    ],
    expectedOutcome:
      'Công thức H₂SO₄ hiển thị đẹp, đúng chuẩn khoa học và không bị thu nhỏ phần chữ viết kế tiếp.',
    targetRoute: { tab: 'assignments', sub: 'question-bank', routeLabel: 'Mở Ngân hàng câu hỏi', teacherOnly: true },
  },
  {
    id: 'ex-8-ion-so4',
    order: 8,
    title: 'Nhập ion SO₄²⁻ có cả chỉ số dưới và điện tích trên',
    category: 'Trình soạn thảo Hóa học',
    chapterId: 'ch8-editor',
    goal: 'Viết chuẩn ion sunfat SO₄²⁻ không bị dính điện tích xuống hàng dưới.',
    steps: [
      'Đặt con trỏ vào khung Trình soạn thảo Hóa học tại vị trí cần viết ion.',
      'Nhấn nút Ion & Điện tích trên thanh công cụ Hóa học.',
      'Nhập phần gốc ion là SO4 và chọn/nhập điện tích là 2-, xem trước hiển thị đúng SO₄²⁻ rồi nhấn nút chèn vào bài.',
    ],
    expectedOutcome:
      'Số 4 nằm ở chỉ số dưới và dấu 2⁻ nằm đúng góc trên bên phải của O.',
    targetRoute: { tab: 'assignments', sub: 'question-bank', routeLabel: 'Mở Ngân hàng câu hỏi', teacherOnly: true },
  },
  {
    id: 'ex-9-reversible-reaction',
    order: 9,
    title: 'Chèn phương trình phản ứng thuận nghịch kèm điều kiện',
    category: 'Trình soạn thảo Hóa học',
    chapterId: 'ch8-editor',
    goal: 'Soạn phương trình N₂(k) + 3H₂(k) ⇌ 2NH₃(k) có mũi tên hai chiều và điều kiện xt, t°, p.',
    steps: [
      'Trong Trình soạn thảo Hóa học, nhấn nút PT phản ứng.',
      'Nhập các chất tham gia N2 (trạng thái k) và 3 H2 (trạng thái k), sản phẩm là 2 NH3 (trạng thái k).',
      'Ở mục mũi tên phản ứng, chọn mũi tên thuận nghịch (⇌), điền điều kiện trên là "xt, t°" và điều kiện dưới là "p".',
      'Kiểm tra bản xem trước phía dưới rồi nhấn xác nhận chèn phương trình vào nội dung.',
    ],
    expectedOutcome:
      'Phương trình hoàn chỉnh kèm mũi tên ⇌ và điều kiện nằm giữa hai chiều hiển thị sắc nét.',
    targetRoute: { tab: 'assignments', sub: 'question-bank', routeLabel: 'Mở Ngân hàng câu hỏi', teacherOnly: true },
  },
  {
    id: 'ex-10-lab-baso4',
    order: 10,
    title: 'Thực hành tạo kết tủa trắng BaSO₄ trong phòng thí nghiệm ảo',
    category: 'Phòng thực hành 2D/3D',
    chapterId: 'ch9-lab2d3d',
    goal: 'Tự pha hai dung dịch BaCl₂ và H₂SO₄ trong ống nghiệm để quan sát kết tủa trắng BaSO₄↓ và phương trình hóa học.',
    steps: [
      'Mở Phòng thực hành 2D/3D → Phòng thí nghiệm ảo 2D/3D.',
      'Tại mục Dụng cụ đang chọn ngay trên bàn thí nghiệm, chọn Ống nghiệm 1 (nhấn Làm lại nếu muốn ống nghiệm sạch).',
      'Bên cột Hóa chất, chọn dung dịch BaCl₂ rồi bấm nút Thêm vào Ống nghiệm 1; tiếp theo chọn dung dịch H₂SO₄ và bấm Thêm vào Ống nghiệm 1.',
      'Quan sát kết tủa trắng BaSO₄ hình thành dưới đáy ống nghiệm, sau đó nhấn Hiện giải thích ở thanh trên cùng để xem phương trình phản ứng.',
    ],
    expectedOutcome:
      'Ống nghiệm xuất hiện lớp kết tủa trắng và bảng giải thích ghi rõ BaCl₂ + H₂SO₄ → BaSO₄↓ + 2HCl.',
    targetRoute: { tab: 'lab', sub: 'virtual-lab', routeLabel: 'Mở Phòng thí nghiệm ảo' },
  },
  {
    id: 'ex-11-lab-2d-3d',
    order: 11,
    title: 'Chuyển đổi chế độ 2D Trực quan và 3D Không gian trong thí nghiệm',
    category: 'Phòng thực hành 2D/3D',
    chapterId: 'ch9-lab2d3d',
    goal: 'So sánh góc nhìn mô phỏng 2D dễ đọc nhãn và 3D xoay không gian trên cùng một thí nghiệm đang chạy.',
    steps: [
      'Giữ nguyên ống nghiệm đang có phản ứng (hoặc chọn 1 bài thí nghiệm mẫu ở danh sách Bài thí nghiệm).',
      'Nhấn nút 3D Không gian ở góc trên phải khung điều khiển Phòng thí nghiệm ảo.',
      'Dùng chuột kéo xoay xung quanh bàn thí nghiệm để quan sát hình khối các dụng cụ thủy tinh và màu dung dịch, sau đó nhấn 2D Trực quan để quay về góc nhìn phẳng.',
    ],
    expectedOutcome:
      'Toàn bộ hóa chất, mực chất lỏng và kết tủa được giữ nguyên vẹn khi chuyển đổi qua lại giữa 2D và 3D.',
    targetRoute: { tab: 'lab', sub: 'virtual-lab', routeLabel: 'Mở Phòng thí nghiệm ảo' },
  },
  {
    id: 'ex-12-flashcard-3d',
    order: 12,
    title: 'Lật thẻ hai mặt và xoay mô hình phân tử 3D trong Flashcard',
    category: 'Flashcard Hóa học',
    chapterId: 'ch11-flashcard',
    goal: 'Quan sát mô hình 3D phân tử NH₃ hoặc H₂O từ mọi góc độ và đối chiếu thông tin khoa học ở mặt sau.',
    steps: [
      'Vào Flashcard Hóa học → Flashcard Hóa học.',
      'Tìm hoặc chọn thẻ Amoniac (NH₃) hoặc Axit sunfuric (H₂SO₄).',
      'Nhấn nút Xoay 3D 360° để mở mô hình không gian phân tử, kéo xoay kiểm tra cấu trúc hình chóp/tứ diện.',
      'Đóng khung xoay 3D, nhấn nút Lật xem mặt sau để đọc chi tiết tính chất hóa học, phản ứng đặc trưng và quy tắc an toàn.',
    ],
    expectedOutcome:
      'Hiểu rõ cấu trúc hình học không gian gắn liền với tính chất hóa học đặc trưng của chất.',
    targetRoute: { tab: 'flashcard', sub: 'flashcard', routeLabel: 'Mở Flashcard Hóa học' },
  },
  {
    id: 'ex-13-view-results',
    order: 13,
    title: 'Xem kết quả học tập ở cả Cổng Giáo viên, Học sinh và Phụ huynh',
    category: 'Kết quả & Phụ huynh',
    chapterId: 'ch12-results-parents',
    goal: 'Hiểu rõ luồng phê duyệt – công bố điểm của Giáo viên và cách Học sinh / Phụ huynh tra cứu điểm chính thức.',
    steps: [
      'Với vai trò Giáo viên: vào Kết quả & Phụ huynh → Bảng điểm & Công bố, kiểm tra bài làm học sinh và bấm Công bố điểm.',
      'Nhấp vào nút chọn vai trò ở góc trên phải thanh đầu trang, chuyển sang Phụ huynh (hoặc Học sinh Nguyễn Minh Khang).',
      'Quan sát bảng điểm chính thức và nhận xét của giáo viên hiển thị ngay sau khi công bố (còn các bài chưa công bố vẫn ở trạng thái chờ chấm/bảo mật).',
    ],
    expectedOutcome:
      'Đảm bảo quy trình bảo mật điểm số chặt chẽ và hiển thị đúng điểm, nhận xét ngay khi được giáo viên duyệt công bố.',
    targetRoute: { tab: 'results-parents', sub: 'results', routeLabel: 'Mở Kết quả & Phụ huynh' },
  },
];

export const GUIDE_FAQS: GuideFaqItem[] = [
  {
    id: 'faq-1',
    question: 'Tôi đang soạn đề kiểm tra hoặc câu hỏi dở mà bấm vào Hướng dẫn sử dụng thì có bị mất dữ liệu không?',
    answer:
      'Không. Nút Hướng dẫn sử dụng mở trang hướng dẫn trong cùng khu vực làm việc nhưng vẫn giữ nguyên toàn bộ trạng thái các trường bạn đang nhập ở nền. Khi nhấn Quay lại chức năng đang sử dụng, toàn bộ nội dung vẫn còn nguyên.',
    relatedChapterId: 'ch1-start',
  },
  {
    id: 'faq-2',
    question: 'Vì sao ở thanh công cụ trình soạn thảo Hóa học không có nút CT Toán?',
    answer:
      'Thanh công cụ đã được chuẩn hóa chuyên biệt cho môn Hóa học THPT theo đúng 6 nhóm nghiệp vụ gồm: CT Hóa, PT phản ứng, Ion & Điện tích, Ký hiệu Hóa học, Cấu tạo 2D và Điều kiện phản ứng, kết hợp trực tiếp hai nút Chỉ số dưới / Chỉ số trên để thao tác nhanh hơn.',
    relatedChapterId: 'ch8-editor',
  },
  {
    id: 'faq-3',
    question: 'Hai học sinh trong lớp 11A1 cùng họ tên Phạm Ngọc Tường Vy có bị nhầm lẫn điểm số không?',
    answer:
      'Không bao giờ. Hệ thống quản lý định danh duy nhất theo Mã học sinh (HS11028 và HS11029), tách biệt hoàn toàn hồ sơ, ngày sinh, SĐT phụ huynh và kết quả kiểm tra của hai em.',
    relatedChapterId: 'ch2-classes',
  },
  {
    id: 'faq-4',
    question: 'Khi tôi bấm Tuyển Chọn Câu Hỏi Bám Sát Ma Trận mà báo thiếu câu thì hệ thống có tự tạo câu giả cho đủ không?',
    answer:
      'Không. Hệ thống tuyệt đối không tự bịa câu hỏi hoặc lấy sai mức độ nhận thức. Thay vào đó, thông báo sẽ liệt kê chính xác ô nào thiếu bao nhiêu câu để bạn mở Ngân hàng câu hỏi bổ sung hoặc điều chỉnh Ma trận.',
    relatedChapterId: 'ch7-question-shuffle',
  },
  {
    id: 'faq-5',
    question: 'Học sinh nộp bài xong nhưng Phụ huynh mở Cổng Phụ huynh lại chưa thấy điểm?',
    answer:
      'Đây là quy tắc bảo mật điểm số của hệ thống: bài nộp có thể đang chờ giáo viên chấm tự luận (NEEDS_REVIEW) hoặc chưa được giáo viên bật Công bố điểm. Khi giáo viên nhấn công bố cho học sinh hoặc cả lớp, điểm và nhận xét sẽ hiện ngay bên Cổng Phụ huynh.',
    relatedChapterId: 'ch12-results-parents',
  },
  {
    id: 'faq-6',
    question: 'Dữ liệu tôi vừa tạo có cần cấu hình máy chủ hay khóa API riêng mới lưu được không?',
    answer:
      'Không. Toàn bộ ma trận, ngân hàng câu hỏi, đề kiểm tra, danh sách học sinh, bài làm và bản nháp được lưu trực tiếp trên bộ nhớ trình duyệt (LocalStorage) và hoạt động offline ổn định mà không cần nhập khóa API trả phí.',
    relatedChapterId: 'ch13-admin',
  },
  {
    id: 'faq-7',
    question: 'Tôi muốn in đề kiểm tra và đáp án ra giấy để phát cho học sinh làm trên lớp thì bấm ở đâu?',
    answer:
      'Vào Bài tập & Kiểm tra → Đề đã lưu & Giao bài, chọn đề cần in rồi nhấn nút Xuất Word / In để tải tệp .docx theo từng mã đề hoặc bộ đầy đủ đáp án – hướng dẫn chấm.',
    relatedChapterId: 'ch7-question-shuffle',
  },
];
