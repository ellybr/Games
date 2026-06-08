using UnityEngine;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }

    public string PlayerName = "Player";
    public int SkinToneIndex = 0;
    public int OutfitIndex = 0;
    public bool IsMujer = false;
    public float MoneyEarned = 0f;
    public int DayNumber = 1;
    public int CustomersServed = 0;
    public float RunningDebt = 0f;
    public float TodayDeliveryCost = 0f;
    public float TodayEarned = 0f;
    public float TodayNet = 0f;
    public bool MissedHospitalBill = false;

    public const float DebtGameOverThreshold = 300f;
    const float HospitalBillAmount = 120f;
    const int HospitalBillInterval = 3;

    void Awake()
    {
        if (Instance != null && Instance != this) { Destroy(gameObject); return; }
        Instance = this;
        DontDestroyOnLoad(gameObject);
    }

    public void StartNewGame()
    {
        MoneyEarned = 0f;
        CustomersServed = 0;
        RunningDebt = 0f;
        TodayEarned = 0f;
        TodayNet = 0f;
        TodayDeliveryCost = 0f;
        DayNumber = 1;
        MissedHospitalBill = false;
        GoToCutscene();
    }

    public float CalculateDeliveryCost(int day)
    {
        var state = Random.state;
        Random.InitState(day * 137 + 31);
        float cost = Mathf.Round(Random.Range(20f, 66f));
        Random.state = state;
        return cost;
    }

    public bool IsHospitalDay() => DayNumber > 0 && DayNumber % HospitalBillInterval == 0;
    public float HospitalBill => HospitalBillAmount;

    public float TotalDailyExpenses() =>
        TodayDeliveryCost + (IsHospitalDay() ? HospitalBillAmount : 0f);

    public void PrepareDay()
    {
        TodayDeliveryCost = CalculateDeliveryCost(DayNumber);
    }

    public void EndDayFinances(float todayEarned)
    {
        float expenses = TotalDailyExpenses();
        float net = todayEarned - expenses;
        TodayEarned = todayEarned;
        TodayNet = net;
        MissedHospitalBill = IsHospitalDay() && net < 0f;

        if (net < 0f)
            RunningDebt += Mathf.Abs(net);
        else
            RunningDebt = Mathf.Max(0f, RunningDebt - net);
    }

    public bool IsGameOver() => RunningDebt >= DebtGameOverThreshold;

    public void GoToCustomization() => UnityEngine.SceneManagement.SceneManager.LoadScene(0);
    public void GoToCutscene()      => UnityEngine.SceneManagement.SceneManager.LoadScene(1);
    public void GoToBodegaDay()     => UnityEngine.SceneManagement.SceneManager.LoadScene(2);
    public void GoToGameOver()      => UnityEngine.SceneManagement.SceneManager.LoadScene(3);
}
