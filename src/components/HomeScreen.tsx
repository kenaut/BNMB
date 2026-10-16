interface HomeScreenProps {
  total: number;
  onStart: () => void;
  onFreePractice: () => void;
}

/** 首页：标题 + 开始训练入口 */
export default function HomeScreen({ total, onStart, onFreePractice }: HomeScreenProps) {
  return (
    <section
      style={{
        backgroundColor: "#fff",
        border: "1px solid #d0d7de",
        borderRadius: 8,
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      <p style={{ color: "#57606a", marginTop: 0 }}>
        ます形 · ない形 · て形 · た形
      </p>
      <p style={{ fontSize: 18, marginBottom: 28 }}>
        每回合 {total} 题，随机考查动词与活用形态，即时判分并统计用时。
      </p>
      <button onClick={onStart} className="btn-primary" style={{ fontSize: 20, padding: "12px 48px" }}>
        开始训练
      </button>
      <div style={{ marginTop: 12 }}>
        <button
          onClick={onFreePractice}
          style={{
            border: "none",
            background: "none",
            color: "#0969da",
            cursor: "pointer",
            fontSize: 14,
            padding: 4,
          }}
        >
          自由练习（不计分、不限题数）
        </button>
      </div>
    </section>
  );
}
