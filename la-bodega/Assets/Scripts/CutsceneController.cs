using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class CutsceneController : MonoBehaviour
{
    public TextMeshProUGUI storyText;
    public TextMeshProUGUI tapHintText;
    public Button tapButton;

    static readonly string[] Panels = {
        "Your abuela has been running the bodega alone for forty years.\n\nShe calls. Her voice is tired.",
        "\"Mijo, I need you home.\"\n\nYou pack a bag and catch the first bus back to the neighborhood.",
        "The bodega smells like it always has.\nCoffee, pine cleaner, and yesterday's pan dulce.",
        "She hands you the keys.\n\n\"Open up at seven. Don't give credit to anyone named Freddy.\"",
        "Today is your first day.\n\nTime to work."
    };

    int currentPanel = 0;

    void Start()
    {
        tapButton.onClick.AddListener(Advance);
        ShowPanel(0);
    }

    void ShowPanel(int index)
    {
        storyText.text = Panels[index];
        bool isLast = index >= Panels.Length - 1;
        tapHintText.text = isLast ? "Tap to begin" : "Tap to continue";
    }

    void Advance()
    {
        currentPanel++;
        if (currentPanel >= Panels.Length)
        {
            if (GameManager.Instance != null)
                GameManager.Instance.GoToBodegaDay();
            else
                UnityEngine.SceneManagement.SceneManager.LoadScene(2);
        }
        else
        {
            ShowPanel(currentPanel);
        }
    }
}
