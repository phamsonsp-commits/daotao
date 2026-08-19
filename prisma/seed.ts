import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log("Seeding dữ liệu mẫu...");

  const admin = await prisma.user.upsert({
    where: { email: "admin@congty.vn" },
    update: {},
    create: {
      email: "admin@congty.vn",
      name: "Nguyễn Văn Quản Trị",
      passwordHash: await hash("admin123"),
      role: "ADMIN",
      level: "MANAGER",
      department: "Ban Giám đốc",
    },
  });

  const staffUser = await prisma.user.upsert({
    where: { email: "nhanvien@congty.vn" },
    update: {},
    create: {
      email: "nhanvien@congty.vn",
      name: "Trần Thị Nhân Viên",
      passwordHash: await hash("nhanvien123"),
      role: "EMPLOYEE",
      level: "STAFF",
      department: "Kinh doanh",
    },
  });

  await prisma.user.upsert({
    where: { email: "thuctap@congty.vn" },
    update: {},
    create: {
      email: "thuctap@congty.vn",
      name: "Lê Văn Thực Tập",
      passwordHash: await hash("thuctap123"),
      role: "EMPLOYEE",
      level: "INTERN",
      department: "Nhân sự",
    },
  });

  await prisma.user.upsert({
    where: { email: "chuyenvien@congty.vn" },
    update: {},
    create: {
      email: "chuyenvien@congty.vn",
      name: "Phạm Thị Chuyên Viên",
      passwordHash: await hash("chuyenvien123"),
      role: "EMPLOYEE",
      level: "SENIOR",
      department: "Chăm sóc khách hàng",
    },
  });

  await prisma.user.upsert({
    where: { email: "quanly@congty.vn" },
    update: {},
    create: {
      email: "quanly@congty.vn",
      name: "Hoàng Văn Quản Lý",
      passwordHash: await hash("quanly123"),
      role: "EMPLOYEE",
      level: "MANAGER",
      department: "Kinh doanh",
    },
  });

  // Xoá dữ liệu tài liệu / chương trình / bài đánh giá cũ để seed lại sạch
  await prisma.quizAttempt.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.programItem.deleteMany();
  await prisma.trainingProgram.deleteMany();
  await prisma.document.deleteMany();

  const docs = await Promise.all([
    prisma.document.create({
      data: {
        title: "Giới thiệu về công ty",
        category: "CONG_TY",
        level: "INTERN",
        tags: "công ty, giới thiệu, hội nhập",
        summary: "Lịch sử hình thành, tầm nhìn, sứ mệnh và cơ cấu tổ chức công ty.",
        content: `## Lịch sử hình thành\n\nCông ty được thành lập với sứ mệnh mang lại giải pháp công nghệ hiệu quả cho khách hàng doanh nghiệp.\n\n## Tầm nhìn & Sứ mệnh\n\n- Tầm nhìn: Trở thành đối tác công nghệ hàng đầu trong lĩnh vực phần mềm quản trị doanh nghiệp.\n- Sứ mệnh: Đồng hành cùng khách hàng chuyển đổi số một cách đơn giản, hiệu quả.\n\n## Cơ cấu tổ chức\n\nCông ty gồm các khối: Kinh doanh, Sản phẩm - Kỹ thuật, Chăm sóc khách hàng, Nhân sự và Tài chính.`,
        createdById: admin.id,
      },
    }),
    prisma.document.create({
      data: {
        title: "Văn hoá doanh nghiệp và giá trị cốt lõi",
        category: "CONG_TY",
        level: "INTERN",
        tags: "văn hoá, giá trị cốt lõi",
        summary: "5 giá trị cốt lõi định hướng hành vi và cách làm việc của toàn thể nhân viên.",
        content: `## 5 giá trị cốt lõi\n\n1. Khách hàng là trọng tâm\n2. Trung thực và minh bạch\n3. Học hỏi không ngừng\n4. Hợp tác vì mục tiêu chung\n5. Chủ động và trách nhiệm\n\n## Quy tắc ứng xử\n\nNhân viên cần tôn trọng đồng nghiệp, giữ gìn hình ảnh công ty khi giao tiếp với khách hàng và đối tác.`,
        createdById: admin.id,
      },
    }),
    prisma.document.create({
      data: {
        title: "Quy chế bảo mật thông tin",
        category: "QUY_CHE",
        level: "INTERN",
        tags: "bảo mật, an toàn thông tin",
        summary: "Quy định về bảo mật dữ liệu khách hàng và thông tin nội bộ công ty.",
        content: `## Phạm vi áp dụng\n\nÁp dụng cho toàn bộ nhân viên, thực tập sinh và cộng tác viên.\n\n## Nguyên tắc bảo mật\n\n- Không chia sẻ tài khoản, mật khẩu cho người khác.\n- Không sao chép dữ liệu khách hàng ra ngoài hệ thống công ty.\n- Báo cáo ngay khi phát hiện sự cố rò rỉ thông tin cho phòng IT.\n\n## Xử lý vi phạm\n\nVi phạm quy chế bảo mật sẽ bị xử lý kỷ luật theo quy định lao động của công ty.`,
        createdById: admin.id,
      },
    }),
    prisma.document.create({
      data: {
        title: "Quy trình onboarding nhân viên mới",
        category: "QUY_TRINH",
        level: "INTERN",
        tags: "onboarding, hội nhập, nhân viên mới",
        summary: "Các bước hội nhập trong 30 ngày đầu tiên khi gia nhập công ty.",
        content: `## Tuần 1\n\n- Nhận thiết bị làm việc, tài khoản email, tài khoản hệ thống nội bộ.\n- Gặp gỡ quản lý trực tiếp và các thành viên trong đội nhóm.\n\n## Tuần 2 - 3\n\n- Hoàn thành các tài liệu đào tạo hội nhập trên nền tảng đào tạo nội bộ.\n- Làm bài đánh giá kiến thức hội nhập.\n\n## Tuần 4\n\n- Đánh giá kết quả thử việc cùng quản lý trực tiếp.`,
        createdById: admin.id,
      },
    }),
    prisma.document.create({
      data: {
        title: "Quy chế nghỉ phép năm 2026",
        category: "QUY_CHE",
        level: "STAFF",
        tags: "nghỉ phép, nhân sự, hr",
        summary: "Quy định về số ngày nghỉ phép năm, cách tính và thủ tục đăng ký.",
        content: `## Số ngày nghỉ phép\n\n- Nhân viên chính thức: 12 ngày phép năm.\n- Cứ 5 năm thâm niên được cộng thêm 1 ngày phép.\n\n## Thủ tục đăng ký\n\nNhân viên đăng ký nghỉ phép trên hệ thống HR tối thiểu 2 ngày làm việc trước ngày nghỉ, trừ trường hợp khẩn cấp.\n\n## Nghỉ phép không hưởng lương\n\nCần được quản lý trực tiếp và phòng Nhân sự phê duyệt trước khi nghỉ.`,
        createdById: admin.id,
      },
    }),
    prisma.document.create({
      data: {
        title: "Quy chế lương thưởng",
        category: "QUY_CHE",
        level: "STAFF",
        tags: "lương, thưởng, nhân sự",
        summary: "Cơ cấu lương, kỳ trả lương và chính sách thưởng hiệu suất.",
        content: `## Kỳ trả lương\n\nLương được trả vào ngày 05 hàng tháng qua tài khoản ngân hàng.\n\n## Thưởng hiệu suất\n\nThưởng KPI quý được xét dựa trên kết quả đánh giá hiệu suất công việc và mức độ hoàn thành mục tiêu.\n\n## Thưởng lễ, Tết\n\nCông ty có chính sách thưởng vào các dịp Lễ, Tết theo quy định hằng năm.`,
        createdById: admin.id,
      },
    }),
    prisma.document.create({
      data: {
        title: "Quy trình xin nghỉ phép",
        category: "QUY_TRINH",
        level: "STAFF",
        tags: "nghỉ phép, quy trình",
        summary: "Các bước đăng ký và phê duyệt nghỉ phép trên hệ thống.",
        content: `## Bước 1\n\nNhân viên tạo đơn nghỉ phép trên hệ thống HR, ghi rõ lý do và thời gian nghỉ.\n\n## Bước 2\n\nQuản lý trực tiếp phê duyệt hoặc từ chối đơn trong vòng 1 ngày làm việc.\n\n## Bước 3\n\nSau khi được duyệt, đơn nghỉ phép được lưu vào hồ sơ nhân sự.`,
        createdById: admin.id,
      },
    }),
    prisma.document.create({
      data: {
        title: "Quy trình bán hàng B2B",
        category: "QUY_TRINH",
        level: "STAFF",
        tags: "bán hàng, kinh doanh, b2b",
        summary: "Quy trình 5 bước từ tiếp cận khách hàng đến ký hợp đồng.",
        content: `## Bước 1: Tìm kiếm khách hàng tiềm năng\n\nXác định chân dung khách hàng mục tiêu và thu thập thông tin liên hệ.\n\n## Bước 2: Tiếp cận & khảo sát nhu cầu\n\nGặp gỡ, trao đổi để hiểu rõ nhu cầu và bài toán của khách hàng.\n\n## Bước 3: Đề xuất giải pháp\n\nGửi báo giá và tài liệu giới thiệu giải pháp phù hợp.\n\n## Bước 4: Đàm phán\n\nThương lượng các điều khoản hợp đồng, giá cả, thời gian triển khai.\n\n## Bước 5: Ký kết hợp đồng\n\nHoàn tất hợp đồng và bàn giao cho đội triển khai.`,
        createdById: admin.id,
      },
    }),
    prisma.document.create({
      data: {
        title: "Quy trình xử lý khiếu nại khách hàng",
        category: "QUY_TRINH",
        level: "STAFF",
        tags: "khiếu nại, chăm sóc khách hàng",
        summary: "Quy trình tiếp nhận, xử lý và phản hồi khiếu nại khách hàng.",
        content: `## Tiếp nhận\n\nGhi nhận khiếu nại qua hotline, email hoặc hệ thống CRM trong vòng 24 giờ.\n\n## Xử lý\n\nPhân loại mức độ ưu tiên và chuyển bộ phận liên quan xử lý.\n\n## Phản hồi khách hàng\n\nPhản hồi kết quả xử lý cho khách hàng trong tối đa 3 ngày làm việc.`,
        createdById: admin.id,
      },
    }),
    prisma.document.create({
      data: {
        title: "Tài liệu sản phẩm: Nền tảng CRM Đám mây",
        category: "SAN_PHAM",
        level: "STAFF",
        tags: "sản phẩm, crm",
        summary: "Tính năng chính và lợi ích của sản phẩm CRM dành cho khách hàng doanh nghiệp.",
        content: `## Tổng quan\n\nNền tảng CRM giúp doanh nghiệp quản lý khách hàng, cơ hội bán hàng và chăm sóc sau bán trên một hệ thống duy nhất.\n\n## Tính năng chính\n\n- Quản lý danh sách khách hàng và lịch sử tương tác\n- Quản lý pipeline bán hàng theo giai đoạn\n- Báo cáo doanh số theo thời gian thực\n\n## Đối tượng khách hàng\n\nPhù hợp với doanh nghiệp vừa và nhỏ trong lĩnh vực thương mại, dịch vụ.`,
        createdById: admin.id,
      },
    }),
    prisma.document.create({
      data: {
        title: "Quy chế đánh giá hiệu suất (KPI)",
        category: "QUY_CHE",
        level: "SENIOR",
        tags: "kpi, hiệu suất, đánh giá",
        summary: "Chu kỳ đánh giá, thang điểm và tiêu chí đánh giá hiệu suất công việc.",
        content: `## Chu kỳ đánh giá\n\nĐánh giá KPI được thực hiện theo quý, tổng kết vào cuối năm.\n\n## Thang điểm\n\nThang điểm 5, trong đó 5 là xuất sắc, 1 là cần cải thiện.\n\n## Tiêu chí đánh giá\n\nBao gồm: kết quả công việc, thái độ làm việc, khả năng phối hợp đội nhóm.`,
        createdById: admin.id,
      },
    }),
    prisma.document.create({
      data: {
        title: "Quy trình phê duyệt chi phí",
        category: "QUY_TRINH",
        level: "SENIOR",
        tags: "chi phí, tài chính, phê duyệt",
        summary: "Hạn mức và quy trình phê duyệt các khoản chi phí phát sinh.",
        content: `## Hạn mức phê duyệt\n\n- Dưới 2.000.000đ: Trưởng nhóm phê duyệt.\n- Từ 2.000.000đ đến 20.000.000đ: Trưởng phòng phê duyệt.\n- Trên 20.000.000đ: Ban Giám đốc phê duyệt.\n\n## Hồ sơ đề nghị\n\nCần có đề nghị chi, hoá đơn/chứng từ hợp lệ gửi kèm.`,
        createdById: admin.id,
      },
    }),
    prisma.document.create({
      data: {
        title: "Tài liệu sản phẩm: Gói dịch vụ Premium",
        category: "SAN_PHAM",
        level: "SENIOR",
        tags: "sản phẩm, premium",
        summary: "Các quyền lợi và tính năng nâng cao dành cho khách hàng gói Premium.",
        content: `## Quyền lợi gói Premium\n\n- Hỗ trợ kỹ thuật ưu tiên 24/7\n- Tuỳ chỉnh báo cáo theo yêu cầu riêng\n- Chuyên viên tư vấn đồng hành triển khai\n\n## Đối tượng phù hợp\n\nKhách hàng doanh nghiệp quy mô lớn có nhu cầu tuỳ biến sâu.`,
        createdById: admin.id,
      },
    }),
    prisma.document.create({
      data: {
        title: "Quy trình quản lý đội nhóm",
        category: "QUY_TRINH",
        level: "MANAGER",
        tags: "quản lý, đội nhóm, lãnh đạo",
        summary: "Hướng dẫn quản lý trực tiếp trong việc giao việc, theo dõi và đánh giá đội nhóm.",
        content: `## Giao việc\n\nGiao mục tiêu rõ ràng, có thời hạn (SMART) cho từng thành viên.\n\n## Theo dõi tiến độ\n\nHọp 1-1 định kỳ hằng tuần với từng thành viên trong nhóm.\n\n## Đánh giá & phát triển\n\nGhi nhận kết quả công việc, đưa ra phản hồi và lộ trình phát triển cho nhân viên.`,
        createdById: admin.id,
      },
    }),
  ]);

  const byTitle = (title: string) => docs.find((d) => d.title === title)!;

  const programIntern = await prisma.trainingProgram.create({
    data: {
      title: "Đào tạo hội nhập cho Nhân viên mới",
      description: "Chương trình bắt buộc cho nhân viên mới và thực tập sinh trong 30 ngày đầu.",
      level: "INTERN",
      status: "PUBLISHED",
      createdById: admin.id,
      items: {
        create: [
          { documentId: byTitle("Giới thiệu về công ty").id, order: 0 },
          { documentId: byTitle("Văn hoá doanh nghiệp và giá trị cốt lõi").id, order: 1 },
          { documentId: byTitle("Quy chế bảo mật thông tin").id, order: 2 },
          { documentId: byTitle("Quy trình onboarding nhân viên mới").id, order: 3 },
        ],
      },
    },
  });

  const programStaff = await prisma.trainingProgram.create({
    data: {
      title: "Đào tạo Nhân viên kinh doanh",
      description: "Trang bị kiến thức quy chế, quy trình và sản phẩm cho nhân viên kinh doanh.",
      level: "STAFF",
      status: "PUBLISHED",
      createdById: admin.id,
      items: {
        create: [
          { documentId: byTitle("Quy chế nghỉ phép năm 2026").id, order: 0 },
          { documentId: byTitle("Quy chế lương thưởng").id, order: 1 },
          { documentId: byTitle("Quy trình xin nghỉ phép").id, order: 2 },
          { documentId: byTitle("Quy trình bán hàng B2B").id, order: 3 },
          { documentId: byTitle("Quy trình xử lý khiếu nại khách hàng").id, order: 4 },
          { documentId: byTitle("Tài liệu sản phẩm: Nền tảng CRM Đám mây").id, order: 5 },
        ],
      },
    },
  });

  const programSenior = await prisma.trainingProgram.create({
    data: {
      title: "Đào tạo Chuyên viên",
      description: "Chương trình nâng cao dành cho chuyên viên, tự động tổng hợp từ kho tài liệu cấp Chuyên viên.",
      level: "SENIOR",
      status: "PUBLISHED",
      autoGenerated: true,
      createdById: admin.id,
      items: {
        create: [
          { documentId: byTitle("Quy chế đánh giá hiệu suất (KPI)").id, order: 0 },
          { documentId: byTitle("Quy trình phê duyệt chi phí").id, order: 1 },
          { documentId: byTitle("Tài liệu sản phẩm: Gói dịch vụ Premium").id, order: 2 },
        ],
      },
    },
  });

  const programManager = await prisma.trainingProgram.create({
    data: {
      title: "Đào tạo Quản lý / Trưởng nhóm",
      description: "Kỹ năng và quy trình dành cho cấp quản lý.",
      level: "MANAGER",
      status: "PUBLISHED",
      createdById: admin.id,
      items: {
        create: [
          { documentId: byTitle("Quy trình quản lý đội nhóm").id, order: 0 },
          { documentId: byTitle("Quy chế đánh giá hiệu suất (KPI)").id, order: 1 },
        ],
      },
    },
  });

  function q(
    text: string,
    options: string[],
    correctIndexes: number[],
    type: "SINGLE_CHOICE" | "MULTI_CHOICE" = "SINGLE_CHOICE",
  ) {
    return {
      text,
      type,
      options: JSON.stringify(options),
      correctIndexes: JSON.stringify(correctIndexes),
    };
  }

  await prisma.quiz.create({
    data: {
      title: "Đánh giá kiến thức hội nhập",
      description: "Kiểm tra kiến thức về công ty, văn hoá và bảo mật thông tin.",
      level: "INTERN",
      passScore: 70,
      programId: programIntern.id,
      createdById: admin.id,
      questions: {
        create: [
          q(
            "Ai chịu trách nhiệm báo cáo khi phát hiện sự cố rò rỉ thông tin?",
            ["Bất kỳ nhân viên nào phát hiện phải báo ngay cho phòng IT", "Chỉ quản lý mới được báo cáo", "Không cần báo cáo nếu sự cố nhỏ", "Chỉ báo cáo vào cuối tháng"],
            [0],
          ),
          q(
            "Chương trình onboarding nhân viên mới kéo dài trong bao lâu?",
            ["7 ngày", "14 ngày", "30 ngày", "60 ngày"],
            [2],
          ),
          q(
            "Đâu là giá trị cốt lõi của công ty? (chọn tất cả đáp án đúng)",
            ["Khách hàng là trọng tâm", "Học hỏi không ngừng", "Làm việc một mình, không cần hợp tác", "Chủ động và trách nhiệm"],
            [0, 1, 3],
            "MULTI_CHOICE",
          ),
        ],
      },
    },
  });

  await prisma.quiz.create({
    data: {
      title: "Đánh giá Quy chế & Quy trình Nhân viên",
      description: "Kiểm tra kiến thức về nghỉ phép, lương thưởng và quy trình bán hàng.",
      level: "STAFF",
      passScore: 70,
      programId: programStaff.id,
      createdById: admin.id,
      questions: {
        create: [
          q(
            "Nhân viên chính thức được nghỉ phép năm bao nhiêu ngày?",
            ["8 ngày", "10 ngày", "12 ngày", "15 ngày"],
            [2],
          ),
          q(
            "Đơn nghỉ phép cần đăng ký trước tối thiểu bao lâu?",
            ["Không cần đăng ký trước", "2 ngày làm việc", "1 tuần", "1 tháng"],
            [1],
          ),
          q(
            "Sắp xếp đúng các bước trong quy trình bán hàng B2B: bước đầu tiên là gì?",
            ["Ký kết hợp đồng", "Đàm phán", "Tìm kiếm khách hàng tiềm năng", "Đề xuất giải pháp"],
            [2],
          ),
          q(
            "Khiếu nại khách hàng cần được phản hồi kết quả xử lý trong tối đa bao lâu?",
            ["24 giờ", "3 ngày làm việc", "1 tuần", "1 tháng"],
            [1],
          ),
        ],
      },
    },
  });

  await prisma.quiz.create({
    data: {
      title: "Đánh giá Chuyên viên",
      description: "Kiểm tra kiến thức về KPI, phê duyệt chi phí và sản phẩm Premium.",
      level: "SENIOR",
      passScore: 75,
      programId: programSenior.id,
      createdById: admin.id,
      questions: {
        create: [
          q(
            "Thang điểm đánh giá KPI của công ty là bao nhiêu?",
            ["Thang điểm 3", "Thang điểm 5", "Thang điểm 10", "Thang điểm 100"],
            [1],
          ),
          q(
            "Khoản chi phí 15.000.000đ cần ai phê duyệt?",
            ["Trưởng nhóm", "Trưởng phòng", "Ban Giám đốc", "Không cần phê duyệt"],
            [1],
          ),
          q(
            "Gói dịch vụ Premium bao gồm quyền lợi nào? (chọn tất cả đáp án đúng)",
            ["Hỗ trợ kỹ thuật ưu tiên 24/7", "Tuỳ chỉnh báo cáo theo yêu cầu riêng", "Miễn phí trọn đời", "Chuyên viên tư vấn đồng hành"],
            [0, 1, 3],
            "MULTI_CHOICE",
          ),
        ],
      },
    },
  });

  await prisma.quiz.create({
    data: {
      title: "Đánh giá Quản lý",
      description: "Kiểm tra kỹ năng và quy trình quản lý đội nhóm.",
      level: "MANAGER",
      passScore: 75,
      programId: programManager.id,
      createdById: admin.id,
      questions: {
        create: [
          q(
            "Quản lý nên họp 1-1 với từng thành viên với tần suất nào?",
            ["Hằng ngày", "Hằng tuần", "Hằng quý", "Không cần họp"],
            [1],
          ),
          q(
            "Nguyên tắc giao việc SMART nhấn mạnh điều gì?",
            ["Mục tiêu rõ ràng, có thời hạn", "Giao càng nhiều việc càng tốt", "Không cần đo lường kết quả", "Chỉ giao việc bằng miệng"],
            [0],
          ),
        ],
      },
    },
  });

  // Dữ liệu minh hoạ tiến độ học tập cho tài khoản nhân viên demo
  const staffItems = await prisma.programItem.findMany({
    where: { programId: programStaff.id },
    orderBy: { order: "asc" },
  });
  const doneItems = staffItems.slice(0, 3).map((i) => i.id);

  await prisma.enrollment.create({
    data: {
      userId: staffUser.id,
      programId: programStaff.id,
      status: "IN_PROGRESS",
      completedItems: JSON.stringify(doneItems),
    },
  });

  const staffQuiz = await prisma.quiz.findFirstOrThrow({
    where: { programId: programStaff.id },
  });
  await prisma.quizAttempt.create({
    data: {
      quizId: staffQuiz.id,
      userId: staffUser.id,
      answers: JSON.stringify({}),
      score: 75,
      passed: true,
    },
  });

  console.log("Seed hoàn tất.");
  console.log("Tài khoản quản trị: admin@congty.vn / admin123");
  console.log("Tài khoản nhân viên demo: nhanvien@congty.vn / nhanvien123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
