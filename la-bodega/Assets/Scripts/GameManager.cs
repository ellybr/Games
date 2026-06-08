using UnityEngine;
using System.Collections.Generic;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }

    // ── Player / persistent state ────────────────────────────────────────────
    public string PlayerName      = "Player";
    public int    SkinToneIndex   = 0;
    public int    OutfitIndex     = 0;
    public bool   IsMujer         = false;
    public float  MoneyEarned     = 0f;
    public int    DayNumber       = 1;
    public int    CustomersServed = 0;
    public float  RunningDebt     = 0f;
    public float  TodayDeliveryCost = 0f;
    public float  TodayEarned     = 0f;
    public float  TodayNet        = 0f;
    public bool   MissedHospitalBill = false;

    public const float DebtGameOverThreshold = 300f;
    const float  HospitalBillAmount   = 120f;
    const int    HospitalBillInterval = 3;

    // ── Phase 1: inner types ─────────────────────────────────────────────────

    public enum DayEvent
    {
        Normal,
        SlowMorning,
        FridayRush,
        Rainstorm,
        SchoolDismissal,
        RentWeek
    }

    public enum ChoiceEffect
    {
        None,
        BoostCoffee,
        BoostSnacks,
        BoostAll,
        ExtraTime,
        ReduceDebt
    }

    public struct DayChoice
    {
        public string       labelA;
        public string       descA;
        public string       labelB;
        public string       descB;
        public ChoiceEffect effectA;
        public ChoiceEffect effectB;
        public float        costA;
        public float        costB;
    }

    public class CustomerRelationship
    {
        public int   trust  = 2;   // 0-5
        public float debt   = 0f;
        public int   visits = 0;
    }

    // ── Phase 1: public fields ───────────────────────────────────────────────
    public DayEvent     TodayEvent        = DayEvent.Normal;
    public ChoiceEffect TodayChoiceEffect = ChoiceEffect.None;

    public float FreddyTotalDebt      = 0f;
    public int   FreddyUnpaidStreak   = 0;
    public bool  FreddyBanned         = false;
    public bool  FreddyPaybackPending = false;

    public Dictionary<string, CustomerRelationship> Relationships
        = new Dictionary<string, CustomerRelationship>();

    // ── Unity lifecycle ──────────────────────────────────────────────────────
    void Awake()
    {
        if (Instance != null && Instance != this) { Destroy(gameObject); return; }
        Instance = this;
        DontDestroyOnLoad(gameObject);
    }

    // ── Game flow ────────────────────────────────────────────────────────────
    public void StartNewGame()
    {
        MoneyEarned       = 0f;
        CustomersServed   = 0;
        RunningDebt       = 0f;
        TodayEarned       = 0f;
        TodayNet          = 0f;
        TodayDeliveryCost = 0f;
        DayNumber         = 1;
        MissedHospitalBill = false;

        TodayEvent           = DayEvent.Normal;
        TodayChoiceEffect    = ChoiceEffect.None;
        FreddyTotalDebt      = 0f;
        FreddyUnpaidStreak   = 0;
        FreddyBanned         = false;
        FreddyPaybackPending = false;
        Relationships        = new Dictionary<string, CustomerRelationship>();

        GoToCutscene();
    }

    // ── Daily finances ───────────────────────────────────────────────────────
    public float CalculateDeliveryCost(int day)
    {
        var state = Random.state;
        Random.InitState(day * 137 + 31);
        float cost = Mathf.Round(Random.Range(20f, 66f));
        Random.state = state;
        return cost;
    }

    public bool  IsHospitalDay()      => DayNumber > 0 && DayNumber % HospitalBillInterval == 0;
    public float HospitalBill         => HospitalBillAmount;
    public float TotalDailyExpenses() => TodayDeliveryCost + (IsHospitalDay() ? HospitalBillAmount : 0f);

    public void PrepareDay()
    {
        TodayDeliveryCost = CalculateDeliveryCost(DayNumber);
        TodayEvent        = DetermineEvent(DayNumber);
        TodayChoiceEffect = ChoiceEffect.None;
    }

    public void EndDayFinances(float todayEarned)
    {
        float expenses = TotalDailyExpenses();
        float net      = todayEarned - expenses;
        TodayEarned    = todayEarned;
        TodayNet       = net;
        MissedHospitalBill = IsHospitalDay() && net < 0f;

        if (net < 0f)
            RunningDebt += Mathf.Abs(net);
        else
            RunningDebt = Mathf.Max(0f, RunningDebt - net);
    }

    public bool IsGameOver() => RunningDebt >= DebtGameOverThreshold;

    // ── Scene navigation ─────────────────────────────────────────────────────
    public void GoToCustomization() => UnityEngine.SceneManagement.SceneManager.LoadScene(0);
    public void GoToCutscene()      => UnityEngine.SceneManagement.SceneManager.LoadScene(1);
    public void GoToBodegaDay()     => UnityEngine.SceneManagement.SceneManager.LoadScene(2);
    public void GoToGameOver()      => UnityEngine.SceneManagement.SceneManager.LoadScene(3);

    // ── Phase 1: Day event logic ─────────────────────────────────────────────
    public DayEvent DetermineEvent(int day)
    {
        if (day % 7 == 5) return DayEvent.FridayRush;
        if (day % 7 == 1) return DayEvent.SlowMorning;
        if (day >= 5 && day % 5 == 0) return DayEvent.RentWeek;

        var state = Random.state;
        Random.InitState(day * 73 + 19);
        float roll = Random.value;
        Random.state = state;

        if (roll < 0.2f)  return DayEvent.Rainstorm;
        if (roll < 0.35f) return DayEvent.SchoolDismissal;
        return DayEvent.Normal;
    }

    public string GetDayEventDescription()
    {
        switch (TodayEvent)
        {
            case DayEvent.SlowMorning:
                return "It's quiet out. Customers are taking their time today.";
            case DayEvent.FridayRush:
                return "It's Friday! Everyone is rushing around. Expect a crowd.";
            case DayEvent.Rainstorm:
                return "It's raining hard outside. Folks will want something warm.";
            case DayEvent.SchoolDismissal:
                return "School lets out early today. Get ready for hungry kids.";
            case DayEvent.RentWeek:
                return "Rent week. Money is tight all around the block.";
            case DayEvent.Normal:
            default:
                return "";
        }
    }

    public DayChoice GetMorningChoice()
    {
        switch (TodayEvent)
        {
            case DayEvent.Rainstorm:
                return new DayChoice
                {
                    labelA  = "Stock extra coffee (-$12)",
                    descA   = "Coffee tips doubled today.",
                    labelB  = "Run as normal",
                    descB   = "Keep your money.",
                    effectA = ChoiceEffect.BoostCoffee,
                    effectB = ChoiceEffect.None,
                    costA   = 12f,
                    costB   = 0f
                };

            case DayEvent.SchoolDismissal:
                return new DayChoice
                {
                    labelA  = "Stock extra snacks (-$10)",
                    descA   = "Snack orders earn +$0.75.",
                    labelB  = "Run as normal",
                    descB   = "Keep your money.",
                    effectA = ChoiceEffect.BoostSnacks,
                    effectB = ChoiceEffect.None,
                    costA   = 10f,
                    costB   = 0f
                };

            case DayEvent.FridayRush:
                return new DayChoice
                {
                    labelA  = "Open 10 min early",
                    descA   = "+15 seconds on the clock.",
                    labelB  = "Normal open",
                    descB   = "Standard day.",
                    effectA = ChoiceEffect.ExtraTime,
                    effectB = ChoiceEffect.None,
                    costA   = 0f,
                    costB   = 0f
                };

            case DayEvent.RentWeek:
                return new DayChoice
                {
                    labelA  = "Pay $20 toward debt",
                    descA   = "Show good faith. Reduces debt now.",
                    labelB  = "Hold the cash",
                    descB   = "Pay at end of week.",
                    effectA = ChoiceEffect.ReduceDebt,
                    effectB = ChoiceEffect.None,
                    costA   = 20f,
                    costB   = 0f
                };

            default:
                return new DayChoice
                {
                    labelA  = "Buy fresh pan dulce (-$8)",
                    descA   = "First 3 customers tip +$0.50.",
                    labelB  = "Skip it",
                    descB   = "Save the $8.",
                    effectA = ChoiceEffect.BoostAll,
                    effectB = ChoiceEffect.None,
                    costA   = 8f,
                    costB   = 0f
                };
        }
    }

    public void MakeChoice(bool choiceA)
    {
        DayChoice choice  = GetMorningChoice();
        TodayChoiceEffect = choiceA ? choice.effectA : choice.effectB;
        float cost        = choiceA ? choice.costA   : choice.costB;
        if (cost > 0f)
            MoneyEarned -= cost;

        if (TodayChoiceEffect == ChoiceEffect.ReduceDebt)
            RunningDebt = Mathf.Max(0f, RunningDebt - cost);
    }

    // ── Phase 1: Relationships ───────────────────────────────────────────────
    public CustomerRelationship GetRelationship(string name)
    {
        if (!Relationships.ContainsKey(name))
            Relationships[name] = new CustomerRelationship();
        return Relationships[name];
    }

    public void RecordServed(string name, bool happy)
    {
        var rel = GetRelationship(name);
        rel.visits++;
        rel.trust = Mathf.Clamp(rel.trust + (happy ? 1 : -1), 0, 5);
    }

    public void RecordFreddyVisit(bool paid)
    {
        if (paid)
        {
            FreddyUnpaidStreak = 0;
            if (FreddyPaybackPending)
            {
                FreddyTotalDebt      = Mathf.Max(0f, FreddyTotalDebt - 5f);
                FreddyPaybackPending = false;
            }
        }
        else
        {
            FreddyUnpaidStreak++;
            FreddyTotalDebt += 2.5f;
        }
    }

    public bool ShouldTriggerFreddyEvent()
    {
        return FreddyUnpaidStreak >= 3 && !FreddyBanned && !FreddyPaybackPending;
    }
}
