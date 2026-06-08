using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections;

public class BodegaDayController : MonoBehaviour
{
    [Header("HUD")]
    public TextMeshProUGUI dayLabel;
    public TextMeshProUGUI moneyLabel;
    public TextMeshProUGUI timerLabel;

    [Header("Customer")]
    public TextMeshProUGUI customerText;
    public TextMeshProUGUI requestText;

    [Header("Item Buttons")]
    public Button coffeeButton;
    public Button sandwichButton;
    public Button snacksButton;
    public Button lotteryButton;

    [Header("Feedback")]
    public TextMeshProUGUI feedbackText;

    [Header("End Overlay")]
    public GameObject endOverlay;
    public TextMeshProUGUI endSummaryText;
    public Button endButton;

    enum Item { Coffee, Sandwich, Snacks, Lottery }

    static readonly string[] CustomerNames = {
        "Dona Rosa", "Mr. Patel", "Little Carlos", "Maria",
        "Big Lou", "Yolanda", "The Professor", "Old Man Tony"
    };

    struct Order { public string request; public Item answer; }

    static readonly Order[] Orders = {
        new Order { request = "Un cafe, please.",         answer = Item.Coffee    },
        new Order { request = "Gimme a sandwich.",        answer = Item.Sandwich  },
        new Order { request = "You got chips?",           answer = Item.Snacks    },
        new Order { request = "Lottery ticket!",          answer = Item.Lottery   },
        new Order { request = "Coffee, no sugar.",        answer = Item.Coffee    },
        new Order { request = "I need a BLT.",            answer = Item.Sandwich  },
        new Order { request = "Snacks for the kids.",     answer = Item.Snacks    },
        new Order { request = "Quick Pick, please.",      answer = Item.Lottery   },
    };

    const float DayDuration = 90f;

    float timeLeft;
    float nextCustomerIn;
    Item currentAnswer;
    bool hasCustomer;
    bool dayOver;
    float moneyEarned;
    int customersServed;

    void Start()
    {
        timeLeft = DayDuration;
        moneyEarned = GameManager.Instance != null ? GameManager.Instance.MoneyEarned : 0f;
        int day = GameManager.Instance != null ? GameManager.Instance.DayNumber : 1;

        dayLabel.text = "Day " + day;
        endOverlay.SetActive(false);
        feedbackText.text = "";
        customerText.text = "";
        requestText.text = "No customers yet.";

        coffeeButton.onClick.AddListener(() => TryServe(Item.Coffee));
        sandwichButton.onClick.AddListener(() => TryServe(Item.Sandwich));
        snacksButton.onClick.AddListener(() => TryServe(Item.Snacks));
        lotteryButton.onClick.AddListener(() => TryServe(Item.Lottery));
        endButton.onClick.AddListener(EndDay);

        nextCustomerIn = 2f;
        UpdateHUD();
    }

    void Update()
    {
        if (dayOver) return;

        timeLeft -= Time.deltaTime;
        nextCustomerIn -= Time.deltaTime;

        if (!hasCustomer && nextCustomerIn <= 0f)
            SpawnCustomer();

        if (timeLeft <= 0f)
        {
            timeLeft = 0f;
            FinishDay();
        }

        UpdateHUD();
    }

    void SpawnCustomer()
    {
        int oi = Random.Range(0, Orders.Length);
        int ni = Random.Range(0, CustomerNames.Length);
        customerText.text = CustomerNames[ni] + " walks in.";
        requestText.text = "\"" + Orders[oi].request + "\"";
        currentAnswer = Orders[oi].answer;
        hasCustomer = true;
    }

    void TryServe(Item given)
    {
        if (!hasCustomer || dayOver) return;

        if (given == currentAnswer)
        {
            float earned = Random.Range(1.5f, 4f);
            moneyEarned += earned;
            customersServed++;
            ShowFeedback("+" + earned.ToString("F2"), true);
        }
        else
        {
            ShowFeedback("Wrong item!", false);
        }

        hasCustomer = false;
        customerText.text = "";
        requestText.text = "";
        nextCustomerIn = Random.Range(2f, 5f);
    }

    void ShowFeedback(string msg, bool good)
    {
        StopCoroutine("ClearFeedback");
        feedbackText.text = msg;
        feedbackText.color = good ? Color.green : Color.red;
        StartCoroutine(ClearFeedback());
    }

    IEnumerator ClearFeedback()
    {
        yield return new WaitForSeconds(1.5f);
        feedbackText.text = "";
    }

    void UpdateHUD()
    {
        moneyLabel.text = "$" + moneyEarned.ToString("F2");
        timerLabel.text = Mathf.CeilToInt(timeLeft) + "s";
    }

    void FinishDay()
    {
        dayOver = true;
        int day = GameManager.Instance != null ? GameManager.Instance.DayNumber : 1;
        endSummaryText.text =
            "Day " + day + " done!\n" +
            "Customers served: " + customersServed + "\n" +
            "Money earned: $" + moneyEarned.ToString("F2");
        endOverlay.SetActive(true);

        if (GameManager.Instance != null)
            GameManager.Instance.MoneyEarned = moneyEarned;
    }

    void EndDay()
    {
        if (GameManager.Instance != null)
            GameManager.Instance.GoToGameOver();
        else
            UnityEngine.SceneManagement.SceneManager.LoadScene(3);
    }
}
