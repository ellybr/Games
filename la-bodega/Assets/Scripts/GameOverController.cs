using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class GameOverController : MonoBehaviour
{
    public TextMeshProUGUI titleText;
    public TextMeshProUGUI summaryText;
    public Button playAgainButton;

    void Start()
    {
        if (GameManager.Instance != null)
        {
            var gm = GameManager.Instance;
            bool isGameOver = gm.IsGameOver();

            if (isGameOver)
            {
                titleText.text = "Bodega Closed";
                summaryText.text =
                    gm.PlayerName + ", the debt got too heavy.\n\n" +
                    "Abuela understands.\n\n" +
                    "Total debt: $" + gm.RunningDebt.ToString("F0") + "\n\n" +
                    "Better luck next time.";

                var btnLabel = playAgainButton.GetComponentInChildren<TextMeshProUGUI>();
                if (btnLabel != null) btnLabel.text = "Try Again";
            }
            else
            {
                titleText.text = "Day " + gm.DayNumber + " Done!";
                string netSign = gm.TodayNet >= 0f ? "+" : "";
                string netColor = gm.TodayNet >= 0f ? "green" : "red";

                summaryText.text =
                    gm.PlayerName + "'s Bodega\n\n" +
                    "Served: " + gm.CustomersServed + " customers\n" +
                    "Earned:   $" + gm.TodayEarned.ToString("F2") + "\n" +
                    "Expenses: -$" + gm.TotalDailyExpenses().ToString("F2") + "\n" +
                    "Net: " + netSign + gm.TodayNet.ToString("F2") +
                    (gm.RunningDebt > 0f ? "\n\nDebt: $" + gm.RunningDebt.ToString("F0") : "") +
                    (gm.MissedHospitalBill ? "\n\nAbuela's treatment was delayed." : "") +
                    "\n\nCome back tomorrow.";

                var btnLabel = playAgainButton.GetComponentInChildren<TextMeshProUGUI>();
                if (btnLabel != null) btnLabel.text = "Next Day";
            }
        }
        else
        {
            titleText.text = "Day Complete!";
            summaryText.text = "Good work today.";
        }

        playAgainButton.onClick.AddListener(PlayAgain);
    }

    void PlayAgain()
    {
        if (GameManager.Instance != null)
        {
            if (GameManager.Instance.IsGameOver())
            {
                GameManager.Instance.StartNewGame();
            }
            else
            {
                GameManager.Instance.DayNumber++;
                GameManager.Instance.GoToCutscene();
            }
        }
        else
        {
            UnityEngine.SceneManagement.SceneManager.LoadScene(0);
        }
    }
}
