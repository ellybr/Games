using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections;
using System.Collections.Generic;

public class BodegaDayController : MonoBehaviour
{
    public enum ItemType { Coffee, Sandwich, Snacks, Lottery }

    struct CustomerDef
    {
        public string   name;
        public ItemType order;
        public string   orderText;
        public float    patienceDuration;
        public float    baseEarning;
        public float    tipBonus;
        public bool     isFreddy;
    }

    class SlotState
    {
        public CustomerDef def;
        public float       patience;
        public bool        active;
        public float       patienceModifier = 1f;
    }

    static readonly CustomerDef[] CustomerPool = {
        new CustomerDef { name="Dona Rosa",     order=ItemType.Coffee,   orderText="Un cafe, please.",             patienceDuration=20f, baseEarning=2f,   tipBonus=1.50f },
        new CustomerDef { name="Mr. Patel",     order=ItemType.Snacks,   orderText="Chips, any kind.",             patienceDuration=12f, baseEarning=2f,   tipBonus=0f    },
        new CustomerDef { name="Little Carlos", order=ItemType.Snacks,   orderText="Gimme snacks!",                patienceDuration=6f,  baseEarning=1.5f, tipBonus=0f    },
        new CustomerDef { name="Maria",         order=ItemType.Coffee,   orderText="Coffee please.",               patienceDuration=11f, baseEarning=2f,   tipBonus=0.50f },
        new CustomerDef { name="Uncle Freddy",  order=ItemType.Sandwich, orderText="Sandwich. I'll pay you back.", patienceDuration=18f, baseEarning=2.5f, tipBonus=0f,   isFreddy=true },
        new CustomerDef { name="Big Lou",       order=ItemType.Sandwich, orderText="Sandwich, now. I'm starving.", patienceDuration=7f,  baseEarning=2.5f, tipBonus=2f    },
        new CustomerDef { name="Yolanda",       order=ItemType.Lottery,  orderText="Quick Pick, please.",          patienceDuration=11f, baseEarning=2f,   tipBonus=0f    },
        new CustomerDef { name="The Professor", order=ItemType.Coffee,   orderText="A coffee, if you would.",     patienceDuration=25f, baseEarning=2f,   tipBonus=3f    },
        new CustomerDef { name="Old Man Tony",  order=ItemType.Lottery,  orderText="Lottery. Same numbers.",      patienceDuration=15f, baseEarning=2f,   tipBonus=0.25f },
    };

    const int   MaxSlots    = 3;
    const float DayDuration = 90f;
    const int   MaxReputation = 5;

    [Header("HUD")]
    public TextMeshProUGUI dayLabel;
    public TextMeshProUGUI moneyLabel;
    public TextMeshProUGUI timerLabel;
    public Image[]         reputationDots;

    [Header("Customer Slots")]
    public GameObject[]      slotRoots;
    public TextMeshProUGUI[] slotNameLabels;
    public TextMeshProUGUI[] slotOrderLabels;
    public Image[]           slotPatienceFills;

    [Header("Feedback")]
    public TextMeshProUGUI feedbackText;

    [Header("Morning Overlay")]
    public GameObject      morningOverlay;
    public TextMeshProUGUI morningTitleText;
    public TextMeshProUGUI morningBillText;
    public Button          openButton;

    [Header("Morning Choice")]
    public TextMeshProUGUI dayEventText;
    public Button          choiceAButton;
    public Button          choiceBButton;

    [Header("End Overlay")]
    public GameObject      endOverlay;
    public TextMeshProUGUI endSummaryText;
    public Button          endButton;

    [Header("Canvas")]
    public RectTransform canvasRect;

    SlotState[] slots = new SlotState[MaxSlots];
    float timeLeft;
    float nextSpawnIn;
    float moneyEarned;
    float moneyEarnedToday;
    int   reputation;
    int   customersServed;
    bool  dayOver;
    bool  dayStarted;

    // Phase 1 bonus tracking
    float coffeeTipBonus  = 0f;
    float snackTipBonus   = 0f;
    int   pandulceLeft    = 0;

    void Start()
    {
        timeLeft         = DayDuration;
        moneyEarned      = GameManager.Instance != null ? GameManager.Instance.MoneyEarned : 0f;
        moneyEarnedToday = 0f;
        int day          = GameManager.Instance != null ? GameManager.Instance.DayNumber : 1;
        reputation       = MaxReputation;
        dayOver          = false;
        dayStarted       = false;

        coffeeTipBonus = 0f;
        snackTipBonus  = 0f;
        pandulceLeft   = 0;

        dayLabel.text    = "Day " + day;
        feedbackText.text = "";
        endOverlay.SetActive(false);

        for (int i = 0; i < MaxSlots; i++)
        {
            slots[i] = new SlotState();
            ClearSlot(i);
        }

        endButton.onClick.AddListener(EndDay);

        // openButton listener is added in SetupMorningChoices / MakeChoice
        // Hide openButton initially; SetupMorningChoices shows it when appropriate
        openButton.gameObject.SetActive(false);

        UpdateHUD();
        RefreshReputation();

        if (GameManager.Instance != null) GameManager.Instance.PrepareDay();
        ShowMorningOverlay();
        SetupMorningChoices();

        nextSpawnIn = 1.5f;
    }

    void ShowMorningOverlay()
    {
        morningOverlay.SetActive(true);
        int day = GameManager.Instance != null ? GameManager.Instance.DayNumber : 1;
        morningTitleText.text = "Day " + day;

        if (dayEventText != null && GameManager.Instance != null)
            dayEventText.text = GameManager.Instance.GetDayEventDescription();

        if (GameManager.Instance != null)
        {
            var gm = GameManager.Instance;
            string bills = "Goya delivery: -$" + gm.TodayDeliveryCost.ToString("F0");
            if (gm.IsHospitalDay())
                bills += "\nAbuela's hospital: -$" + gm.HospitalBill.ToString("F0");
            bills += "\n\nYou need $" + gm.TotalDailyExpenses().ToString("F0") + " to break even.";
            if (gm.RunningDebt > 0f)
                bills += "\n\nDebt on the books: $" + gm.RunningDebt.ToString("F0");
            morningBillText.text = bills;
        }
        else
        {
            morningBillText.text = "Open up and get to work.";
        }
    }

    void SetupMorningChoices()
    {
        var gm = GameManager.Instance;

        if (gm == null)
        {
            if (choiceAButton != null) choiceAButton.gameObject.SetActive(false);
            if (choiceBButton != null) choiceBButton.gameObject.SetActive(false);
            openButton.gameObject.SetActive(true);
            openButton.onClick.AddListener(OpenBodega);
            return;
        }

        if (gm.ShouldTriggerFreddyEvent())
        {
            // Freddy intervention choices
            if (choiceAButton != null)
            {
                choiceAButton.gameObject.SetActive(true);
                var lblA = choiceAButton.GetComponentInChildren<TextMeshProUGUI>();
                if (lblA != null)
                {
                    lblA.enableWordWrapping = true;
                    lblA.text = "Ban Freddy\nHe's not welcome anymore.";
                }
                choiceAButton.onClick.RemoveAllListeners();
                choiceAButton.onClick.AddListener(() =>
                {
                    gm.FreddyBanned = true;
                    morningBillText.text += "\n\nFreddy is banned. No more free sandwiches.";
                    if (choiceAButton != null) choiceAButton.gameObject.SetActive(false);
                    if (choiceBButton != null) choiceBButton.gameObject.SetActive(false);
                    openButton.gameObject.SetActive(true);
                    openButton.onClick.AddListener(OpenBodega);
                });
            }

            if (choiceBButton != null)
            {
                choiceBButton.gameObject.SetActive(true);
                var lblB = choiceBButton.GetComponentInChildren<TextMeshProUGUI>();
                if (lblB != null)
                {
                    lblB.enableWordWrapping = true;
                    lblB.text = "Give him a chance\nHe has to pay $5 back today.";
                }
                choiceBButton.onClick.RemoveAllListeners();
                choiceBButton.onClick.AddListener(() =>
                {
                    gm.FreddyPaybackPending  = true;
                    gm.FreddyUnpaidStreak    = 0;
                    morningBillText.text += "\n\nFreddy owes you. He knows it.";
                    if (choiceAButton != null) choiceAButton.gameObject.SetActive(false);
                    if (choiceBButton != null) choiceBButton.gameObject.SetActive(false);
                    openButton.gameObject.SetActive(true);
                    openButton.onClick.AddListener(OpenBodega);
                });
            }
        }
        else
        {
            var choice = gm.GetMorningChoice();

            if (choiceAButton != null)
            {
                choiceAButton.gameObject.SetActive(true);
                var lblA = choiceAButton.GetComponentInChildren<TextMeshProUGUI>();
                if (lblA != null)
                {
                    lblA.enableWordWrapping = true;
                    lblA.text = choice.labelA + "\n" + choice.descA;
                }
                choiceAButton.onClick.RemoveAllListeners();
                choiceAButton.onClick.AddListener(() => MakeChoice(true));
            }

            if (choiceBButton != null)
            {
                choiceBButton.gameObject.SetActive(true);
                var lblB = choiceBButton.GetComponentInChildren<TextMeshProUGUI>();
                if (lblB != null)
                {
                    lblB.enableWordWrapping = true;
                    lblB.text = choice.labelB + "\n" + choice.descB;
                }
                choiceBButton.onClick.RemoveAllListeners();
                choiceBButton.onClick.AddListener(() => MakeChoice(false));
            }
        }
    }

    void MakeChoice(bool choiceA)
    {
        var gm = GameManager.Instance;
        if (gm == null)
        {
            if (choiceAButton != null) choiceAButton.gameObject.SetActive(false);
            if (choiceBButton != null) choiceBButton.gameObject.SetActive(false);
            openButton.gameObject.SetActive(true);
            openButton.onClick.AddListener(OpenBodega);
            return;
        }

        var choice = gm.GetMorningChoice();
        gm.MakeChoice(choiceA);

        var effect = gm.TodayChoiceEffect;

        switch (effect)
        {
            case GameManager.ChoiceEffect.BoostCoffee:
                coffeeTipBonus = 1f;
                morningBillText.text += "\n\nExtra coffee stocked. Tips doubled on coffee today.";
                break;
            case GameManager.ChoiceEffect.BoostSnacks:
                snackTipBonus = 0.75f;
                morningBillText.text += "\n\nExtra snacks ready. Snack orders earn +$0.75.";
                break;
            case GameManager.ChoiceEffect.BoostAll:
                pandulceLeft = 3;
                morningBillText.text += "\n\nPan dulce is fresh. First 3 customers tip extra.";
                break;
            case GameManager.ChoiceEffect.ExtraTime:
                timeLeft += 15f;
                morningBillText.text += "\n\nOpening early. +15 seconds on the clock.";
                break;
            case GameManager.ChoiceEffect.ReduceDebt:
                morningBillText.text += "\n\nPaid $20 toward debt. Good faith goes a long way.";
                break;
            case GameManager.ChoiceEffect.None:
            default:
                if (choiceA)
                    morningBillText.text += "\n\nKeeping it simple. Standard day.";
                else
                    morningBillText.text += "\n\nSaved the cash. No extras today.";
                break;
        }

        if (choiceAButton != null) choiceAButton.gameObject.SetActive(false);
        if (choiceBButton != null) choiceBButton.gameObject.SetActive(false);
        openButton.gameObject.SetActive(true);
        openButton.onClick.AddListener(OpenBodega);
    }

    void OpenBodega()
    {
        morningOverlay.SetActive(false);
        dayStarted = true;
    }

    void Update()
    {
        if (!dayStarted || dayOver) return;

        timeLeft    -= Time.deltaTime;
        nextSpawnIn -= Time.deltaTime;

        for (int i = 0; i < MaxSlots; i++)
        {
            if (!slots[i].active) continue;
            slots[i].patience -= Time.deltaTime / (slots[i].def.patienceDuration * slots[i].patienceModifier);
            if (slots[i].patience <= 0f)
                CustomerLeaves(i, angry: true);
        }

        if (nextSpawnIn <= 0f && CountActive() < MaxSlots)
        {
            int empty = FindEmptySlot();
            if (empty >= 0) SpawnCustomer(empty);

            float interval = Random.Range(3f, 6f);

            if (GameManager.Instance != null)
            {
                var evt = GameManager.Instance.TodayEvent;
                if (evt == GameManager.DayEvent.FridayRush || evt == GameManager.DayEvent.SchoolDismissal)
                    interval *= 0.65f;
                else if (evt == GameManager.DayEvent.SlowMorning || evt == GameManager.DayEvent.Rainstorm)
                    interval *= 1.4f;
            }

            nextSpawnIn = interval;
        }

        if (timeLeft <= 0f)
        {
            timeLeft = 0f;
            FinishDay();
        }

        UpdateHUD();
        UpdatePatienceBars();
    }

    void SpawnCustomer(int i)
    {
        // Build available pool, excluding banned Freddy
        var available = new List<CustomerDef>();
        bool freddyBanned = GameManager.Instance != null && GameManager.Instance.FreddyBanned;
        foreach (var c in CustomerPool)
        {
            if (c.isFreddy && freddyBanned) continue;
            available.Add(c);
        }
        if (available.Count == 0) return;

        CustomerDef def;
        var evtType = GameManager.Instance != null ? GameManager.Instance.TodayEvent : GameManager.DayEvent.Normal;

        // Bias selection by event
        float roll = Random.value;
        if (evtType == GameManager.DayEvent.Rainstorm && roll < 0.50f)
        {
            var coffeePool = new List<CustomerDef>();
            foreach (var c in available)
                if (c.order == ItemType.Coffee) coffeePool.Add(c);
            def = coffeePool.Count > 0
                ? coffeePool[Random.Range(0, coffeePool.Count)]
                : available[Random.Range(0, available.Count)];
        }
        else if (evtType == GameManager.DayEvent.SchoolDismissal && roll < 0.40f)
        {
            var snackPool = new List<CustomerDef>();
            foreach (var c in available)
                if (c.order == ItemType.Snacks) snackPool.Add(c);
            def = snackPool.Count > 0
                ? snackPool[Random.Range(0, snackPool.Count)]
                : available[Random.Range(0, available.Count)];
        }
        else
        {
            def = available[Random.Range(0, available.Count)];
        }

        slots[i].def      = def;
        slots[i].patience = 1f;
        slots[i].active   = true;

        // Trust modifier
        float trustMod = 1f;
        if (GameManager.Instance != null)
        {
            var rel = GameManager.Instance.GetRelationship(def.name);
            trustMod = 1f + rel.trust * 0.08f;
        }
        slots[i].patienceModifier = trustMod;

        // Big Lou in a non-zero slot reduces patience modifier
        if (i > 0 && def.name == "Big Lou")
            slots[i].patienceModifier *= 0.6f;

        slotRoots[i].SetActive(true);
        slotNameLabels[i].text  = def.name;
        slotOrderLabels[i].text = "\"" + def.orderText + "\"";
        slotPatienceFills[i].fillAmount = 1f;
        slotPatienceFills[i].color      = Color.green;
    }

    public void TryServeAtScreenPoint(Vector2 screenPos, ItemType item, Camera cam)
    {
        if (!dayStarted || dayOver) return;

        for (int i = 0; i < MaxSlots; i++)
        {
            if (!slots[i].active) continue;
            var rt = slotRoots[i].GetComponent<RectTransform>();
            if (RectTransformUtility.RectangleContainsScreenPoint(rt, screenPos, cam))
            {
                ServeSlot(i, item);
                return;
            }
        }
        ShowFeedback("Drop on a customer!", false);
    }

    void ServeSlot(int i, ItemType item)
    {
        var def = slots[i].def;

        if (item != def.order)
        {
            ShowFeedback("Wrong item!", false);
            slots[i].patience -= 0.25f;
            if (slots[i].patience <= 0f) CustomerLeaves(i, angry: true);
            return;
        }

        if (def.isFreddy)
        {
            var gm = GameManager.Instance;

            // Check if Freddy is in forced payback mode
            if (gm != null && gm.FreddyPaybackPending)
            {
                float reward = def.baseEarning + 5f;
                moneyEarned      += reward;
                moneyEarnedToday += reward;
                ShowFeedback("Freddy paid you back! $" + reward.ToString("F2"), true);
                gm?.RecordFreddyVisit(true);
                gm?.RecordServed(def.name, true);
            }
            else
            {
                bool pays = Random.value > 0.5f;
                if (pays)
                {
                    moneyEarned      += def.baseEarning;
                    moneyEarnedToday += def.baseEarning;
                    ShowFeedback("Freddy actually paid! $" + def.baseEarning.ToString("F2"), true);
                    gm?.RecordFreddyVisit(true);
                    gm?.RecordServed(def.name, true);
                }
                else
                {
                    ShowFeedback("Freddy: \"I'll get you next time.\"", false);
                    gm?.RecordFreddyVisit(false);
                    gm?.RecordServed(def.name, false);
                }
            }

            customersServed++;
            CustomerLeaves(i, angry: false);
            return;
        }

        float tip = def.tipBonus * slots[i].patience;

        // Apply day event bonuses
        if (def.order == ItemType.Coffee)
            tip += coffeeTipBonus;
        if (def.order == ItemType.Snacks)
            tip += snackTipBonus;

        float pandulceTip = 0f;
        if (pandulceLeft > 0)
        {
            pandulceTip = 0.50f;
            pandulceLeft--;
        }

        float earned = def.baseEarning + tip + pandulceTip;
        moneyEarned      += earned;
        moneyEarnedToday += earned;
        customersServed++;

        string msg = "+" + earned.ToString("F2");
        if (tip > 0.1f || pandulceTip > 0f) msg += "  (tip!)";
        ShowFeedback(msg, true);

        GameManager.Instance?.RecordServed(def.name, true);

        CustomerLeaves(i, angry: false);
    }

    void CustomerLeaves(int i, bool angry)
    {
        if (angry)
        {
            GameManager.Instance?.RecordServed(slots[i].def.name, false);
            reputation = Mathf.Max(0, reputation - 1);
            RefreshReputation();
            ShowFeedback(slots[i].def.name + " left angry!", false);
            if (reputation <= 0) { FinishDay(); return; }
        }
        ClearSlot(i);
    }

    void ClearSlot(int i)
    {
        slots[i].active = false;
        slotRoots[i].SetActive(false);
    }

    void UpdatePatienceBars()
    {
        for (int i = 0; i < MaxSlots; i++)
        {
            if (!slots[i].active) continue;
            float p = Mathf.Max(0f, slots[i].patience);
            slotPatienceFills[i].fillAmount = p;
            slotPatienceFills[i].color      = Color.Lerp(Color.red, Color.green, p);
        }
    }

    void RefreshReputation()
    {
        for (int i = 0; i < reputationDots.Length; i++)
            reputationDots[i].color = i < reputation
                ? new Color(1f, 0.85f, 0.2f)
                : new Color(0.3f, 0.3f, 0.3f);
    }

    void ShowFeedback(string msg, bool good)
    {
        StopCoroutine("ClearFeedback");
        feedbackText.text  = msg;
        feedbackText.color = good ? Color.green : Color.red;
        StartCoroutine(ClearFeedback());
    }

    IEnumerator ClearFeedback()
    {
        yield return new WaitForSeconds(2f);
        feedbackText.text = "";
    }

    void UpdateHUD()
    {
        moneyLabel.text = "$" + moneyEarned.ToString("F2");
        timerLabel.text = Mathf.CeilToInt(timeLeft) + "s";
    }

    int CountActive()
    {
        int n = 0;
        for (int i = 0; i < MaxSlots; i++) if (slots[i].active) n++;
        return n;
    }

    int FindEmptySlot()
    {
        for (int i = 0; i < MaxSlots; i++) if (!slots[i].active) return i;
        return -1;
    }

    void FinishDay()
    {
        if (dayOver) return;
        dayOver = true;

        if (GameManager.Instance != null)
        {
            GameManager.Instance.MoneyEarned = moneyEarned;
            GameManager.Instance.EndDayFinances(moneyEarnedToday);
        }

        int   day      = GameManager.Instance != null ? GameManager.Instance.DayNumber : 1;
        float expenses = GameManager.Instance != null ? GameManager.Instance.TotalDailyExpenses() : 0f;
        float net      = moneyEarnedToday - expenses;
        string netColor = net >= 0 ? "+" : "";
        string header   = reputation <= 0 ? "Closed early!\nNo rep left." : "Day " + day + " done!";

        endSummaryText.text =
            header + "\n\n" +
            "Served: " + customersServed + " customers\n" +
            "Earned:   $" + moneyEarnedToday.ToString("F2") + "\n" +
            "Expenses: -$" + expenses.ToString("F2") + "\n" +
            "Net: " + netColor + net.ToString("F2") +
            (GameManager.Instance != null && GameManager.Instance.RunningDebt > 0f
                ? "\n\nDebt: $" + GameManager.Instance.RunningDebt.ToString("F0")
                : "");

        endOverlay.SetActive(true);
    }

    void EndDay()
    {
        if (GameManager.Instance != null)
            GameManager.Instance.GoToGameOver();
        else
            UnityEngine.SceneManagement.SceneManager.LoadScene(3);
    }
}
