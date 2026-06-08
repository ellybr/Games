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
            titleText.text = "Day " + GameManager.Instance.DayNumber + " Complete!";
            summaryText.text =
                "Name: " + GameManager.Instance.PlayerName + "\n" +
                "Total earned: $" + GameManager.Instance.MoneyEarned.ToString("F2") + "\n\n" +
                "Come back tomorrow.";
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
            GameManager.Instance.DayNumber++;
            GameManager.Instance.GoToCustomization();
        }
        else
        {
            UnityEngine.SceneManagement.SceneManager.LoadScene(0);
        }
    }
}
