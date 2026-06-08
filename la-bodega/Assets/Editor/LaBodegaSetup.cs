using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using UnityEditor;
using UnityEditor.SceneManagement;
using TMPro;

public static class LaBodegaSetup
{
    const string SceneFolder = "Assets/Scenes";
    const string ScenePath = "Assets/Scenes/";

    [MenuItem("Tools/La Bodega/Setup Full Project")]
    public static void SetupFullProject()
    {
        if (!AssetDatabase.IsValidFolder(SceneFolder))
            AssetDatabase.CreateFolder("Assets", "Scenes");

        BuildCharacterCustomizationScene();
        BuildCutsceneScene();
        BuildBodegaDayScene();
        BuildGameOverScene();
        SetBuildSettings();

        EditorSceneManager.OpenScene(ScenePath + "CharacterCustomization.unity");

        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();
        Debug.Log("[La Bodega] Setup complete. Press Play to test.");
    }

    // ── Scene 0 ────────────────────────────────────────────────────────────────

    static void BuildCharacterCustomizationScene()
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        AddCamera();
        AddEventSystem();

        new GameObject("GameManager").AddComponent<GameManager>();

        var canvas = MakeCanvas();
        var ct = canvas.transform;

        MakePanel(ct, "Background", new Color(0.12f, 0.08f, 0.05f));

        var title = MakeTMP(ct, "Title", "La Bodega", 52);
        AnchorPos(title.gameObject, new Vector2(0, 330), new Vector2(360, 70));

        var sub = MakeTMP(ct, "Subtitle", "Create Your Character", 22);
        sub.color = new Color(0.8f, 0.7f, 0.5f);
        AnchorPos(sub.gameObject, new Vector2(0, 280), new Vector2(360, 40));

        var nameLabel = MakeTMP(ct, "NameLabel", "Your Name", 20);
        nameLabel.color = new Color(0.8f, 0.8f, 0.8f);
        AnchorPos(nameLabel.gameObject, new Vector2(0, 205), new Vector2(300, 30));

        var nameInput = MakeTMPInputField(ct, new Vector2(0, 158), new Vector2(300, 46));

        var skinLabel = MakeTMP(ct, "SkinLabel", "Skin Tone", 20);
        skinLabel.color = new Color(0.8f, 0.8f, 0.8f);
        AnchorPos(skinLabel.gameObject, new Vector2(0, 98), new Vector2(300, 30));

        Color[] tones = {
            new Color(1.00f, 0.87f, 0.75f),
            new Color(0.94f, 0.76f, 0.58f),
            new Color(0.78f, 0.58f, 0.39f),
            new Color(0.55f, 0.35f, 0.20f),
            new Color(0.35f, 0.22f, 0.13f),
        };
        var skinBtns = new Button[5];
        for (int i = 0; i < 5; i++)
        {
            var sb = new GameObject("SkinBtn_" + i);
            sb.transform.SetParent(ct, false);
            AnchorPos(sb, new Vector2(-96f + i * 48f, 57), new Vector2(40, 40));
            sb.AddComponent<Image>().color = tones[i];
            skinBtns[i] = sb.AddComponent<Button>();
            var cb = skinBtns[i].colors;
            cb.highlightedColor = Color.white;
            skinBtns[i].colors = cb;
        }

        var outfitSectionLabel = MakeTMP(ct, "OutfitSectionLabel", "Outfit", 20);
        outfitSectionLabel.color = new Color(0.8f, 0.8f, 0.8f);
        AnchorPos(outfitSectionLabel.gameObject, new Vector2(0, -5), new Vector2(300, 30));

        var prevBtn = MakeButton(ct, "PrevOutfit", "<", 28, new Color(0.25f, 0.25f, 0.25f));
        AnchorPos(prevBtn.gameObject, new Vector2(-120, -52), new Vector2(50, 50));

        var outfitName = MakeTMP(ct, "OutfitName", "Classic Tee", 22);
        AnchorPos(outfitName.gameObject, new Vector2(0, -52), new Vector2(180, 50));

        var nextBtn = MakeButton(ct, "NextOutfit", ">", 28, new Color(0.25f, 0.25f, 0.25f));
        AnchorPos(nextBtn.gameObject, new Vector2(120, -52), new Vector2(50, 50));

        var startBtn = MakeButton(ct, "StartButton", "Start Game", 28, new Color(0.9f, 0.4f, 0.1f));
        AnchorPos(startBtn.gameObject, new Vector2(0, -162), new Vector2(240, 62));

        var ctrl = new GameObject("Controller").AddComponent<CharacterCustomizationController>();
        ctrl.nameInput = nameInput;
        ctrl.skinToneButtons = skinBtns;
        ctrl.outfitLabel = outfitName;
        ctrl.prevOutfitButton = prevBtn;
        ctrl.nextOutfitButton = nextBtn;
        ctrl.startButton = startBtn;

        EditorSceneManager.SaveScene(scene, ScenePath + "CharacterCustomization.unity");
    }

    // ── Scene 1 ────────────────────────────────────────────────────────────────

    static void BuildCutsceneScene()
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        AddCamera();
        AddEventSystem();

        var canvas = MakeCanvas();
        var ct = canvas.transform;

        MakePanel(ct, "Background", Color.black);

        var story = MakeTMP(ct, "StoryText", "", 24);
        story.enableWordWrapping = true;
        story.color = Color.white;
        Stretch(story.gameObject, new Vector2(0.07f, 0.25f), new Vector2(0.93f, 0.82f));

        var hint = MakeTMP(ct, "TapHint", "Tap to continue", 18);
        hint.color = new Color(0.65f, 0.65f, 0.65f);
        AnchorPos(hint.gameObject, new Vector2(0, -340), new Vector2(300, 40));

        var tapGO = new GameObject("TapButton");
        tapGO.transform.SetParent(ct, false);
        Stretch(tapGO, Vector2.zero, Vector2.one);
        tapGO.AddComponent<Image>().color = new Color(0, 0, 0, 0);
        var tapBtn = tapGO.AddComponent<Button>();
        var tapCols = tapBtn.colors;
        tapCols.normalColor      = new Color(0, 0, 0, 0);
        tapCols.highlightedColor = new Color(0, 0, 0, 0);
        tapCols.pressedColor     = new Color(1, 1, 1, 0.04f);
        tapBtn.colors = tapCols;
        tapGO.transform.SetAsLastSibling();

        var ctrl = new GameObject("Controller").AddComponent<CutsceneController>();
        ctrl.storyText = story;
        ctrl.tapHintText = hint;
        ctrl.tapButton = tapBtn;

        EditorSceneManager.SaveScene(scene, ScenePath + "Cutscene.unity");
    }

    // ── Scene 2 ────────────────────────────────────────────────────────────────

    static void BuildBodegaDayScene()
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        AddCamera();
        AddEventSystem();

        var canvas = MakeCanvas();
        var ct = canvas.transform;
        var canvasRT = canvas.GetComponent<RectTransform>();

        MakePanel(ct, "Background", new Color(0.10f, 0.07f, 0.04f));

        // ── HUD bar ──
        var hud = MakePanel(ct, "HUDBar", new Color(0.05f, 0.05f, 0.05f, 0.92f), false);
        Stretch(hud, new Vector2(0f, 0.90f), new Vector2(1f, 1f));

        var dayLbl = MakeTMP(hud.transform, "DayLabel", "Day 1", 20);
        Stretch(dayLbl.gameObject, new Vector2(0f, 0f), new Vector2(0.33f, 1f),
            new Vector2(6, 0), new Vector2(-6, 0));

        var moneyLbl = MakeTMP(hud.transform, "MoneyLabel", "$0.00", 20);
        moneyLbl.color = new Color(0.3f, 1f, 0.3f);
        Stretch(moneyLbl.gameObject, new Vector2(0.33f, 0f), new Vector2(0.66f, 1f),
            new Vector2(6, 0), new Vector2(-6, 0));

        var timerLbl = MakeTMP(hud.transform, "TimerLabel", "90s", 20);
        timerLbl.color = new Color(1f, 0.8f, 0.2f);
        Stretch(timerLbl.gameObject, new Vector2(0.66f, 0f), new Vector2(1f, 1f),
            new Vector2(6, 0), new Vector2(-6, 0));

        // ── Reputation dots (5 circles below HUD) ──
        var repRow = new GameObject("ReputationRow");
        repRow.transform.SetParent(ct, false);
        Stretch(repRow, new Vector2(0.2f, 0.84f), new Vector2(0.8f, 0.90f));

        var repDots = new Image[5];
        for (int i = 0; i < 5; i++)
        {
            var dot = new GameObject("RepDot_" + i);
            dot.transform.SetParent(repRow.transform, false);
            AnchorPos(dot, new Vector2(-80f + i * 40f, 0), new Vector2(26, 26));
            repDots[i] = dot.AddComponent<Image>();
            repDots[i].color = new Color(1f, 0.85f, 0.2f);
        }

        // ── 3 customer slots ──
        var slotRoots       = new GameObject[3];
        var slotNameLabels  = new TextMeshProUGUI[3];
        var slotOrderLabels = new TextMeshProUGUI[3];
        var slotFills       = new Image[3];

        float[] slotX = { -125f, 0f, 125f };

        for (int i = 0; i < 3; i++)
        {
            var slot = new GameObject("CustomerSlot_" + i);
            slot.transform.SetParent(ct, false);
            AnchorPos(slot, new Vector2(slotX[i], 120f), new Vector2(112f, 195f));
            slot.AddComponent<Image>().color = new Color(0.18f, 0.12f, 0.08f);
            slotRoots[i] = slot;
            slot.SetActive(false);

            // Name
            var nameLabel = MakeTMP(slot.transform, "SlotName", "Name", 15);
            nameLabel.color = new Color(0.9f, 0.75f, 0.55f);
            Stretch(nameLabel.gameObject,
                new Vector2(0f, 0.75f), new Vector2(1f, 1f),
                new Vector2(4, 2), new Vector2(-4, -2));
            slotNameLabels[i] = nameLabel;

            // Order bubble
            var bubble = new GameObject("OrderBubble");
            bubble.transform.SetParent(slot.transform, false);
            Stretch(bubble, new Vector2(0f, 0.22f), new Vector2(1f, 0.75f),
                new Vector2(4, 4), new Vector2(-4, -4));
            bubble.AddComponent<Image>().color = new Color(0.25f, 0.17f, 0.10f);

            var orderLabel = MakeTMP(bubble.transform, "OrderText", "...", 13);
            orderLabel.color = Color.white;
            orderLabel.enableWordWrapping = true;
            Stretch(orderLabel.gameObject, Vector2.zero, Vector2.one,
                new Vector2(4, 4), new Vector2(-4, -4));
            slotOrderLabels[i] = orderLabel;

            // Patience bar
            var barBG = new GameObject("PatBG");
            barBG.transform.SetParent(slot.transform, false);
            Stretch(barBG, new Vector2(0f, 0f), new Vector2(1f, 0.22f),
                new Vector2(4, 4), new Vector2(-4, -4));
            barBG.AddComponent<Image>().color = new Color(0.15f, 0.15f, 0.15f);

            var barFill = new GameObject("PatFill");
            barFill.transform.SetParent(barBG.transform, false);
            Stretch(barFill, Vector2.zero, Vector2.one,
                new Vector2(2, 2), new Vector2(-2, -2));
            var fillImg = barFill.AddComponent<Image>();
            fillImg.color = Color.green;
            fillImg.type = Image.Type.Filled;
            fillImg.fillMethod = Image.FillMethod.Horizontal;
            fillImg.fillOrigin = 0;
            fillImg.fillAmount = 1f;
            slotFills[i] = fillImg;
        }

        // ── Feedback text ──
        var feedback = MakeTMP(ct, "FeedbackText", "", 24);
        feedback.color = Color.green;
        AnchorPos(feedback.gameObject, new Vector2(0, -65f), new Vector2(340f, 50f));

        // ── Shelf ──
        var shelf = new GameObject("Shelf");
        shelf.transform.SetParent(ct, false);
        Stretch(shelf, new Vector2(0f, 0f), new Vector2(1f, 0.28f));
        shelf.AddComponent<Image>().color = new Color(0.07f, 0.05f, 0.03f);

        var shelfLbl = MakeTMP(shelf.transform, "ShelfLabel", "Drag to serve", 15);
        shelfLbl.color = new Color(0.55f, 0.45f, 0.30f);
        Stretch(shelfLbl.gameObject,
            new Vector2(0f, 0.72f), new Vector2(1f, 1f));

        string[] itemNames = { "Coffee", "Sandwich", "Snacks", "Lottery" };
        BodegaDayController.ItemType[] itemTypes = {
            BodegaDayController.ItemType.Coffee,
            BodegaDayController.ItemType.Sandwich,
            BodegaDayController.ItemType.Snacks,
            BodegaDayController.ItemType.Lottery,
        };
        Color[] itemColors = {
            new Color(0.40f, 0.20f, 0.05f),
            new Color(0.50f, 0.35f, 0.10f),
            new Color(0.20f, 0.45f, 0.15f),
            new Color(0.15f, 0.25f, 0.50f),
        };
        float[] itemX = { -135f, -45f, 45f, 135f };

        var draggables = new DraggableItem[4];
        for (int i = 0; i < 4; i++)
        {
            var item = new GameObject("Item_" + itemNames[i]);
            item.transform.SetParent(shelf.transform, false);
            AnchorPos(item, new Vector2(itemX[i], -18f), new Vector2(76f, 60f));
            item.AddComponent<Image>().color = itemColors[i];
            item.AddComponent<CanvasGroup>();
            var drag = item.AddComponent<DraggableItem>();
            drag.itemType = itemTypes[i];
            draggables[i] = drag;

            var lbl = MakeTMP(item.transform, "Label", itemNames[i], 15);
            lbl.color = Color.white;
            Stretch(lbl.gameObject, Vector2.zero, Vector2.one);
        }

        // ── End-of-day overlay ──
        var endOverlay = MakePanel(ct, "EndOverlay", new Color(0f, 0f, 0f, 0.88f));
        endOverlay.SetActive(false);

        var endSummary = MakeTMP(endOverlay.transform, "EndSummary", "", 22);
        endSummary.color = Color.white;
        endSummary.enableWordWrapping = true;
        Stretch(endSummary.gameObject,
            new Vector2(0.08f, 0.35f), new Vector2(0.92f, 0.80f));

        var endBtn = MakeButton(endOverlay.transform, "EndButton", "End Day", 28,
            new Color(0.9f, 0.4f, 0.1f));
        AnchorPos(endBtn.gameObject, new Vector2(0, -100), new Vector2(220, 62));

        // ── Wire controller ──
        var ctrl = new GameObject("Controller").AddComponent<BodegaDayController>();
        ctrl.dayLabel         = dayLbl;
        ctrl.moneyLabel       = moneyLbl;
        ctrl.timerLabel       = timerLbl;
        ctrl.reputationDots   = repDots;
        ctrl.slotRoots        = slotRoots;
        ctrl.slotNameLabels   = slotNameLabels;
        ctrl.slotOrderLabels  = slotOrderLabels;
        ctrl.slotPatienceFills = slotFills;
        ctrl.feedbackText     = feedback;
        ctrl.endOverlay       = endOverlay;
        ctrl.endSummaryText   = endSummary;
        ctrl.endButton        = endBtn;
        ctrl.canvasRect       = canvasRT;

        foreach (var drag in draggables)
            drag.controller = ctrl;

        EditorSceneManager.SaveScene(scene, ScenePath + "BodegaDay.unity");
    }

    // ── Scene 3 ────────────────────────────────────────────────────────────────

    static void BuildGameOverScene()
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        AddCamera();
        AddEventSystem();

        var canvas = MakeCanvas();
        var ct = canvas.transform;

        MakePanel(ct, "Background", new Color(0.05f, 0.03f, 0.02f));

        var titleTxt = MakeTMP(ct, "TitleText", "Day Complete!", 44);
        titleTxt.color = new Color(1f, 0.85f, 0.3f);
        AnchorPos(titleTxt.gameObject, new Vector2(0, 200), new Vector2(360, 70));

        var summaryTxt = MakeTMP(ct, "SummaryText", "", 24);
        summaryTxt.color = Color.white;
        summaryTxt.enableWordWrapping = true;
        AnchorPos(summaryTxt.gameObject, new Vector2(0, 40), new Vector2(340, 200));

        var playAgainBtn = MakeButton(ct, "PlayAgainButton", "Play Again", 28,
            new Color(0.9f, 0.4f, 0.1f));
        AnchorPos(playAgainBtn.gameObject, new Vector2(0, -172), new Vector2(240, 62));

        var ctrl = new GameObject("Controller").AddComponent<GameOverController>();
        ctrl.titleText     = titleTxt;
        ctrl.summaryText   = summaryTxt;
        ctrl.playAgainButton = playAgainBtn;

        EditorSceneManager.SaveScene(scene, ScenePath + "GameOver.unity");
    }

    // ── Build settings ─────────────────────────────────────────────────────────

    static void SetBuildSettings()
    {
        EditorBuildSettings.scenes = new EditorBuildSettingsScene[]
        {
            new EditorBuildSettingsScene(ScenePath + "CharacterCustomization.unity", true),
            new EditorBuildSettingsScene(ScenePath + "Cutscene.unity",               true),
            new EditorBuildSettingsScene(ScenePath + "BodegaDay.unity",              true),
            new EditorBuildSettingsScene(ScenePath + "GameOver.unity",               true),
        };
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    static Canvas MakeCanvas()
    {
        var go = new GameObject("Canvas");
        var c = go.AddComponent<Canvas>();
        c.renderMode = RenderMode.ScreenSpaceOverlay;
        var scaler = go.AddComponent<CanvasScaler>();
        scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        scaler.referenceResolution = new Vector2(390, 844);
        scaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
        scaler.matchWidthOrHeight = 0.5f;
        go.AddComponent<GraphicRaycaster>();
        return c;
    }

    static void AddCamera()
    {
        var go = new GameObject("Main Camera");
        go.tag = "MainCamera";
        var cam = go.AddComponent<Camera>();
        cam.clearFlags = CameraClearFlags.SolidColor;
        cam.backgroundColor = Color.black;
        cam.orthographic = true;
        go.AddComponent<AudioListener>();
    }

    static void AddEventSystem()
    {
        var go = new GameObject("EventSystem");
        go.AddComponent<EventSystem>();
        go.AddComponent<StandaloneInputModule>();
    }

    static GameObject MakePanel(Transform parent, string name, Color color, bool fullStretch = true)
    {
        var go = new GameObject(name);
        go.transform.SetParent(parent, false);
        go.AddComponent<Image>().color = color;
        if (fullStretch)
            Stretch(go, Vector2.zero, Vector2.one);
        return go;
    }

    static TextMeshProUGUI MakeTMP(Transform parent, string name, string text, float size,
        TextAlignmentOptions align = TextAlignmentOptions.Center)
    {
        var go = new GameObject(name);
        go.transform.SetParent(parent, false);
        var t = go.AddComponent<TextMeshProUGUI>();
        t.text = text;
        t.fontSize = size;
        t.alignment = align;
        t.color = Color.white;
        return t;
    }

    static Button MakeButton(Transform parent, string name, string label, float fontSize, Color bg)
    {
        var go = new GameObject(name);
        go.transform.SetParent(parent, false);
        go.AddComponent<Image>().color = bg;
        var btn = go.AddComponent<Button>();

        var lgo = new GameObject("Label");
        lgo.transform.SetParent(go.transform, false);
        var tmp = lgo.AddComponent<TextMeshProUGUI>();
        tmp.text = label;
        tmp.fontSize = fontSize;
        tmp.alignment = TextAlignmentOptions.Center;
        tmp.color = Color.white;
        var lrt = lgo.GetComponent<RectTransform>();
        lrt.anchorMin = Vector2.zero;
        lrt.anchorMax = Vector2.one;
        lrt.offsetMin = Vector2.zero;
        lrt.offsetMax = Vector2.zero;

        return btn;
    }

    static TMP_InputField MakeTMPInputField(Transform parent, Vector2 anchoredPos, Vector2 size)
    {
        var go = new GameObject("NameInput");
        go.transform.SetParent(parent, false);
        AnchorPos(go, anchoredPos, size);
        go.AddComponent<Image>().color = new Color(0.18f, 0.18f, 0.18f);
        var field = go.AddComponent<TMP_InputField>();

        var area = new GameObject("Text Area");
        area.transform.SetParent(go.transform, false);
        area.AddComponent<RectMask2D>();
        var art = area.GetComponent<RectTransform>();
        art.anchorMin = Vector2.zero;
        art.anchorMax = Vector2.one;
        art.offsetMin = new Vector2(6, 2);
        art.offsetMax = new Vector2(-6, -2);

        var textGO = new GameObject("Text");
        textGO.transform.SetParent(area.transform, false);
        var textComp = textGO.AddComponent<TextMeshProUGUI>();
        textComp.fontSize = 20;
        textComp.color = Color.white;
        textComp.alignment = TextAlignmentOptions.Left;
        SetFullRect(textGO);

        var phGO = new GameObject("Placeholder");
        phGO.transform.SetParent(area.transform, false);
        var phComp = phGO.AddComponent<TextMeshProUGUI>();
        phComp.text = "Enter your name...";
        phComp.fontSize = 20;
        phComp.color = new Color(0.45f, 0.45f, 0.45f);
        phComp.fontStyle = FontStyles.Italic;
        phComp.alignment = TextAlignmentOptions.Left;
        SetFullRect(phGO);

        field.textViewport = art;
        field.textComponent = textComp;
        field.placeholder = phComp;

        return field;
    }

    static void AnchorPos(GameObject go, Vector2 pos, Vector2 size)
    {
        var rt = go.GetComponent<RectTransform>();
        if (rt == null) rt = go.AddComponent<RectTransform>();
        rt.anchorMin = new Vector2(0.5f, 0.5f);
        rt.anchorMax = new Vector2(0.5f, 0.5f);
        rt.anchoredPosition = pos;
        rt.sizeDelta = size;
    }

    static void Stretch(GameObject go, Vector2 anchorMin, Vector2 anchorMax,
        Vector2 offsetMin = default, Vector2 offsetMax = default)
    {
        var rt = go.GetComponent<RectTransform>();
        if (rt == null) rt = go.AddComponent<RectTransform>();
        rt.anchorMin = anchorMin;
        rt.anchorMax = anchorMax;
        rt.offsetMin = offsetMin;
        rt.offsetMax = offsetMax;
    }

    static void SetFullRect(GameObject go)
    {
        var rt = go.GetComponent<RectTransform>();
        rt.anchorMin = Vector2.zero;
        rt.anchorMax = Vector2.one;
        rt.offsetMin = Vector2.zero;
        rt.offsetMax = Vector2.zero;
    }
}
