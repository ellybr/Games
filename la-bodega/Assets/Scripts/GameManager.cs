using UnityEngine;
using UnityEngine.SceneManagement;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }

    public string PlayerName = "Player";
    public int SkinToneIndex = 2;
    public int OutfitIndex = 0;
    public float MoneyEarned = 0f;
    public int DayNumber = 1;
    public int CustomersServed = 0;

    void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;
        DontDestroyOnLoad(gameObject);
    }

    public void GoToScene(int index) => SceneManager.LoadScene(index);
    public void GoToCustomization() => GoToScene(0);
    public void GoToCutscene() => GoToScene(1);
    public void GoToBodegaDay() => GoToScene(2);
    public void GoToGameOver() => GoToScene(3);

    public void StartNewGame()
    {
        MoneyEarned = 0f;
        CustomersServed = 0;
        GoToCutscene();
    }
}
