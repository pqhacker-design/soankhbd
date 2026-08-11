import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { PlannerWizard } from './components/PlannerWizard';
import { LessonPlanEditorView } from './components/LessonPlanEditorView';
import { LessonPlansLibraryView } from './components/LessonPlansLibraryView';
import { MaterialsBankView } from './components/MaterialsBankView';
import { DocumentLibraryView } from './components/DocumentLibraryView';
import { AiChatAdvisorModal } from './components/AiChatAdvisorModal';
import { AdminManagementView } from './components/AdminManagementView';
import { SwitchUserModal } from './components/SwitchUserModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { FullLessonPlan, UserProfile } from './types';

const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'usr-admin',
    name: 'Thầy Nguyễn Văn An',
    email: 'admin@nguyendu.edu.vn',
    password: '123456',
    role: 'Admin',
    school: 'Trường THCS Nguyễn Du',
    department: 'Tổ Toán - Tự Nhiên',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
  },
  {
    id: 'usr-mai',
    name: 'Cô Trần Thị Mai',
    email: 'tranthimai@lequydon.edu.vn',
    password: '123456',
    role: 'Giáo viên',
    school: 'Trường THPT Lê Quý Đôn',
    department: 'Tổ Ngữ Văn',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  },
  {
    id: 'usr-nam',
    name: 'Thầy Lê Văn Nam',
    email: 'levannam@chuvanan.edu.vn',
    password: '123456',
    role: 'Giáo viên',
    school: 'Trường THCS Chu Văn An',
    department: 'Tổ Khoa Học Tự Nhiên',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  },
  {
    id: 'usr-ha',
    name: 'Cô Phạm Thanh Hà',
    email: 'phamthanhha@nguyenbinhkhiem.edu.vn',
    password: '123456',
    role: 'Giáo viên',
    school: 'Trường Tiểu Học Nguyễn Bỉnh Khiêm',
    department: 'Tổ Khối 4 - 5',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
  },
];

const INITIAL_SAMPLE_PLAN: FullLessonPlan = {
  id: 'lp-sample-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  level: 'THCS',
  subject: 'Toán',
  grade: 'Lớp 7',
  textbook: 'Kết nối tri thức với cuộc sống',
  info: {
    lessonTitle: 'Biểu thức đại số và Bảng tần số',
    topic: 'Chương IV: Một số yếu tố Thống kê và Xác suất',
    periodNumber: 'Tiết 28',
    duration: '45 phút',
    date: '2026-08-10',
    classGroup: 'Lớp 7A1',
    schoolName: 'Trường THCS Nguyễn Du',
    teacherName: 'Thầy Nguyễn Văn An',
    departmentName: 'Tổ Toán - Tự Nhiên',
  },
  objectives: {
    qualities: ['Chăm chỉ', 'Trung thực', 'Trách nhiệm'],
    generalCompetencies: [
      'Tự chủ và tự học: Tự đọc SGK và hoàn thành nhiệm vụ cá nhân.',
      'Giao tiếp và hợp tác: Chủ động trao đổi ý kiến trong nhóm.',
      'Giải quyết vấn đề và sáng tạo: Lập bảng tần số cho dãy số liệu thực tế.',
    ],
    specificCompetencies: [
      'Năng lực Toán học: Nhận biết biểu thức đại số, tính giá trị biểu thức.',
      'Năng lực Tin học & Số: Sử dụng phần mềm thống kê đơn giản.',
    ],
    requirementsToAchieve: [
      'Nhận biết được biểu thức đại số và chỉ ra được các biến số.',
      'Lập được bảng tần số cho dãy số liệu thống kê đơn giản.',
      'Vận dụng giải quyết bài toán tính chi phí mua sắm thực tế.',
    ],
  },
  methodologies: {
    methods: ['Trò chơi học tập', 'Hợp tác nhóm', 'Dạy học khám phá'],
    techniques: ['Brainstorming (Công não)', 'Sơ đồ tư duy (Mindmap)'],
    organizationForms: ['Nhóm nhỏ (3-5 HS)', 'Cả lớp'],
  },
  equipmentsAndMaterials: {
    equipments: [
      'Máy chiếu (Projector)',
      'Tivi thông minh',
      'Phiếu học tập / Bảng nhóm',
      'Máy tính / Laptop',
    ],
    materials: ['SGK Toán 7 tập 2', 'Vở bài tập', 'Phiếu trắc nghiệm củng cố'],
  },
  integratedTopics: ['Chuyển đổi số & Kỹ năng số', 'Giáo dục STEM / STEAM'],
  differentiation: {
    weakSupport: 'Hướng dẫn chi tiết qua phiếu hỗ trợ có ví dụ mẫu từng bước.',
    averageSupport: 'Yêu cầu hoàn thành các bài tập cơ bản SGK.',
    advancedSupport: 'Giao bài toán thực tế tổng hợp tính chi phí ngân sách gia đình.',
    giftedSupport: 'Thách thức lập thuật toán tính tần số tự động.',
    specialNeedsSupport: 'GV hỗ trợ trực tiếp tại nhóm.',
  },
  activities: [
    {
      id: 'act-1',
      type: 'warmup',
      name: 'Mở đầu / Khởi động (Trò chơi Thử tài mua sắm)',
      duration: '5 phút',
      objective: 'Tạo không khí sôi nổi, dẫn dắt học sinh vào khái niệm biểu thức chứa chữ.',
      content: 'Học sinh tham gia trò chơi tính tổng số tiền mua x quyển vở và y cái bút.',
      product: 'Câu trả lời của đại diện các nhóm (Ví dụ: Số tiền = 10000x + 5000y).',
      implementation: {
        transfer: 'a) GV trình chiếu tình huống siêu thị giảm giá và phổ biến thể lệ trò chơi ghép thẻ.',
        execution: 'b) HS thảo luận nhanh theo cặp đôi trong 2 phút để tìm ra biểu thức tính tổng tiền.',
        reporting: 'c) Đại diện 2 cặp đôi xung phong trả lời và giải thích ý nghĩa x, y.',
        conclusion: 'd) GV nhận xét tuyên dương và dẫn dắt: Biểu thức 10000x + 5000y gọi là Biểu thức đại số.',
      },
      teacherRole: 'GV làm trọng tài, điều phối không khí trò chơi.',
      studentRole: 'HS tích cực suy luận, tương tác nhanh.',
      promptsAndQuestions: ['Nếu mua 3 quyển vở và 2 bút thì hết bao nhiêu tiền?'],
      anticipatedSituations: 'HS nhầm lẫn giữa chữ số và biến số.',
      supportMeasures: 'GV gợi ý thay x = 3, y = 2 vào biểu thức.',
    },
    {
      id: 'act-2',
      type: 'knowledge',
      name: 'Hình thành kiến thức mới (Khái niệm Biểu thức đại số)',
      duration: '18 phút',
      objective: 'HS phát biểu được định nghĩa biểu thức đại số và nhận biết các biến số.',
      content: 'HS đọc SGK mục 1, thảo luận nhóm để phân biệt biểu thức số và biểu thức đại số.',
      product: 'Phiếu học tập số 1 hoàn thành định nghĩa và ví dụ minh họa.',
      implementation: {
        transfer: 'a) GV giao nhiệm vụ cho 4 nhóm đọc SGK và hoàn thành Trạm 1 trên phiếu học tập.',
        execution: 'b) HS trong nhóm phân công nhiệm vụ, thảo luận và ghi kết quả vào bảng phụ.',
        reporting: 'c) Nhóm 1 treo bảng phụ báo cáo, các nhóm khác nhận xét bổ sung.',
        conclusion: 'd) GV chốt kiến thức: Biểu thức đại số gồm số, chữ và các phép toán.',
      },
      teacherRole: 'GV quan sát, hướng dẫn các nhóm gặp khó khăn.',
      studentRole: 'HS thảo luận nhóm chủ động.',
      promptsAndQuestions: ['Điểm khác nhau giữa 2 + 3 và 2x + 3 là gì?'],
      anticipatedSituations: 'HS quên viết dấu nhân giữa số và chữ.',
      supportMeasures: 'GV nhắc quy ước bỏ dấu nhân giữa số và chữ (2.x = 2x).',
    },
    {
      id: 'act-3',
      type: 'practice',
      name: 'Luyện tập (Tính giá trị biểu thức đại số & Bảng tần số)',
      duration: '12 phút',
      objective: 'HS rèn luyện kỹ năng thay giá trị của biến vào biểu thức và lập bảng tần số.',
      content: 'HS làm bài tập 1, 2 trang 45 SGK cá nhân sau đó đổi vở chấm chéo.',
      product: 'Bài giải chính xác trong vở của học sinh.',
      implementation: {
        transfer: 'a) GV chiếu đề bài tập 1, 2 và yêu cầu HS làm bài độc lập.',
        execution: 'b) HS suy nghĩ làm bài cá nhân vào vở trong 8 phút.',
        reporting: 'c) GV gọi 2 HS lên bảng trình bày, cả lớp đổi vở kiểm tra chéo.',
        conclusion: 'd) GV chốt đáp án, nhận xét bài làm trên bảng và tuyên dương HS làm đúng.',
      },
      teacherRole: 'GV chấm xác suất 5 bài mẫu tại lớp.',
      studentRole: 'HS làm bài tập trung, tự giác.',
      promptsAndQuestions: ['Bước đầu tiên khi tính giá trị biểu thức là gì?'],
      anticipatedSituations: 'HS tính sai thứ tự thực hiện phép tính.',
      supportMeasures: 'GV nhắc lại thứ tự: Nhân chia trước, cộng trừ sau.',
    },
    {
      id: 'act-4',
      type: 'application',
      name: 'Vận dụng (Bài toán lập ngân sách mua sắm thực tế)',
      duration: '8 phút',
      objective: 'Vận dụng biểu thức đại số để tính toán chi phí dụng cụ học tập đầu năm.',
      content: 'HS thực hiện bài toán lập kế hoạch mua sắm đồ dùng học tập cho bản thân.',
      product: 'Bảng tính chi phí và số tiền dự kiến.',
      implementation: {
        transfer: 'a) GV đưa ra tình huống thực tế gia đình cấp ngân sách 200.000đ mua đồ dùng.',
        execution: 'b) HS lập biểu thức chi phí theo giá tiền thực tế.',
        reporting: 'c) 2 HS chia sẻ kế hoạch chi tiêu hợp lý.',
        conclusion: 'd) GV nhận xét và giao bài tập về nhà mở rộng.',
      },
      teacherRole: 'GV định hướng giáo dục tài chính.',
      studentRole: 'HS liên hệ thực tế.',
      promptsAndQuestions: ['Làm thế nào để tối ưu chi phí trong ngân sách?'],
      anticipatedSituations: 'HS vượt ngân sách.',
      supportMeasures: 'GV hướng dẫn điều chỉnh số lượng mua.',
    },
  ],
  assessment: {
    type: 'Đánh giá thường xuyên qua quan sát, sản phẩm phiếu học tập và kiểm tra nhanh',
    details: 'GV nhận xét thái độ hợp tác nhóm, sản phẩm phiếu học tập và điểm chấm chéo bài tập.',
    rubrics: [
      {
        criteria: 'Thái độ tham gia hoạt động nhóm',
        level4: 'Chủ động, tích cực dẫn dắt nhóm, hỗ trợ bạn nhiệt tình',
        level3: 'Tham gia tích cực, hoàn thành tốt nhiệm vụ',
        level2: 'Có tham gia nhưng cần sự nhắc nhở',
        level1: 'Uể ả, chưa chú ý thực hiện nhiệm vụ',
      },
      {
        criteria: 'Chất lượng sản phẩm bài làm',
        level4: 'Chính xác tuyệt đối, trình bày khoa học, thẩm mỹ',
        level3: 'Chính xác, đầy đủ các yêu cầu cơ bản',
        level2: 'Còn 1-2 sai sót nhỏ trong tính toán',
        level1: 'Chưa hoàn thành hoặc sai sót nhiều',
      },
    ],
  },
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Registered Users state persisted in localStorage
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const local = localStorage.getItem('ai_planner_users_v3');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_USERS;
  });

  // Current Active User state persisted in localStorage
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const local = localStorage.getItem('ai_planner_current_user_v3');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_USERS[0];
  });

  const [isSwitchUserOpen, setIsSwitchUserOpen] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [planToDelete, setPlanToDelete] = useState<FullLessonPlan | null>(null);

  const [lessonPlans, setLessonPlans] = useState<FullLessonPlan[]>(() => {
    const local = localStorage.getItem('ai_lesson_plans');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error(e);
      }
    }
    return [INITIAL_SAMPLE_PLAN];
  });

  const [selectedPlan, setSelectedPlan] = useState<FullLessonPlan>(INITIAL_SAMPLE_PLAN);

  // Sync users & current user to local storage
  useEffect(() => {
    localStorage.setItem('ai_planner_users_v3', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('ai_planner_current_user_v3', JSON.stringify(currentUser));
  }, [currentUser]);

  // Sync lesson plans to local storage
  useEffect(() => {
    localStorage.setItem('ai_lesson_plans', JSON.stringify(lessonPlans));
  }, [lessonPlans]);

  // Handle dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handlePlanGenerated = (newPlan: FullLessonPlan) => {
    setLessonPlans([newPlan, ...lessonPlans]);
    setSelectedPlan(newPlan);
    setActiveTab('editor');
  };

  const handleSavePlan = (updatedPlan: FullLessonPlan) => {
    const updated = lessonPlans.map((p) => (p.id === updatedPlan.id ? updatedPlan : p));
    setLessonPlans(updated);
    setSelectedPlan(updatedPlan);
  };

  const handleSelectPlan = (plan: FullLessonPlan) => {
    setSelectedPlan(plan);
    setActiveTab('editor');
  };

  const handleDuplicatePlan = (plan: FullLessonPlan) => {
    const duplicated: FullLessonPlan = {
      ...plan,
      id: `lp-${Date.now()}`,
      info: {
        ...plan.info,
        lessonTitle: `${plan.info.lessonTitle} (Bản sao)`,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLessonPlans([duplicated, ...lessonPlans]);
    setSelectedPlan(duplicated);
    setActiveTab('editor');
  };

  const handleDeletePlan = (id: string) => {
    const target = lessonPlans.find((p) => p.id === id) || ({ id } as FullLessonPlan);
    setPlanToDelete(target);
  };

  const executeDeletePlan = () => {
    if (!planToDelete) return;
    const remaining = lessonPlans.filter((p) => p.id !== planToDelete.id);
    setLessonPlans(remaining);
    if (remaining.length > 0) {
      if (selectedPlan?.id === planToDelete.id) {
        setSelectedPlan(remaining[0]);
      }
    } else {
      setLessonPlans([INITIAL_SAMPLE_PLAN]);
      setSelectedPlan(INITIAL_SAMPLE_PLAN);
    }
    setPlanToDelete(null);
  };

  const handleImportPlans = (imported: FullLessonPlan[]) => {
    setLessonPlans([...imported, ...lessonPlans]);
    if (imported.length > 0) {
      setSelectedPlan(imported[0]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 font-sans transition-colors flex flex-col selection:bg-[#244F70]/20 selection:text-[#244F70]">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={currentUser}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onNewPlan={() => setActiveTab('planner')}
        onOpenSwitchUser={() => setIsSwitchUserOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      <div className="flex-1 flex flex-col md:flex-row max-w-[1536px] w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          savedCount={lessonPlans.length}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              lessonPlans={lessonPlans}
              onSelectPlan={handleSelectPlan}
              onNewPlan={() => setActiveTab('planner')}
              onDuplicatePlan={handleDuplicatePlan}
              onDeletePlan={handleDeletePlan}
            />
          )}

          {activeTab === 'planner' && (
            <PlannerWizard
              currentUser={currentUser}
              onPlanGenerated={handlePlanGenerated}
            />
          )}

          {activeTab === 'editor' && (
            <LessonPlanEditorView
              plan={selectedPlan}
              onSavePlan={handleSavePlan}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'library' && (
            <LessonPlansLibraryView
              lessonPlans={lessonPlans}
              onSelectPlan={handleSelectPlan}
              onNewPlan={() => setActiveTab('planner')}
              onDuplicatePlan={handleDuplicatePlan}
              onDeletePlan={handleDeletePlan}
              onImportPlans={handleImportPlans}
            />
          )}

          {activeTab === 'materials' && <MaterialsBankView />}

          {activeTab === 'documents' && <DocumentLibraryView />}

          {activeTab === 'chat' && <AiChatAdvisorModal />}

          {activeTab === 'admin' && (
            <AdminManagementView
              currentUser={currentUser}
              users={users}
              onUpdateUsers={setUsers}
              onSwitchUser={(u) => setCurrentUser(u)}
              lessonPlans={lessonPlans}
              onImportPlans={handleImportPlans}
            />
          )}
        </main>
      </div>

      {/* Switch User / Login Modal */}
      <SwitchUserModal
        isOpen={isSwitchUserOpen}
        onClose={() => setIsSwitchUserOpen(false)}
        currentUser={currentUser}
        usersList={users}
        onSwitchUser={(u) => setCurrentUser(u)}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

      {/* Confirm Delete Lesson Plan Modal */}
      <ConfirmDeleteModal
        isOpen={!!planToDelete}
        title="Xác nhận xóa Kế hoạch bài dạy"
        message={`Thầy cô có chắc chắn muốn xóa bài dạy "${planToDelete?.info?.lessonTitle || 'này'}" khỏi danh sách? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa Kế Hoạch Bài Dạy"
        onConfirm={executeDeletePlan}
        onCancel={() => setPlanToDelete(null)}
      />
    </div>
  );
}
